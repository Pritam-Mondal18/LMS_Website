import { useEffect, useState, useMemo, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import axios from 'axios';
import { logoutUser } from '../../redux/slices/authSlice';
import Footer from '../../components/common/Footer';
import Logo from '../../components/common/Logo';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  CircleDollarSign,
  Plus,
  PlusCircle,
  ChevronRight,
  X,
  Calendar,
  FileText,
  MessageSquare,
  FolderOpen,
  Settings,
  LogOut,
  Menu,
  Bell,
  ChevronDown,
  Search,
  ArrowRight,
  ArrowUp,
  Download,
  Send,
  Award,
  Megaphone,
  Video,
  Upload,
  FileSpreadsheet,
  UserCheck,
  Pencil,
  Trash2
} from 'lucide-react';


export default function TeacherDashboard() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Sidebar responsive controls
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [headerDropdownOpen, setHeaderDropdownOpen] = useState(false);

  // Active view tab state
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard';
  const setActiveTab = (tab) => setSearchParams({ tab }, { replace: true });

  // Search filter query
  const [searchQuery, setSearchQuery] = useState('');

  // Course Modals
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [activeCourseId, setActiveCourseId] = useState(null);

  // Profile fields fallback
  const teacherName = user?.name || 'Subir Sen';
  const teacherEmail = user?.email || 'teacher@sumitacademy.com';

  // New Course Form State
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    shortDescription: '',
    price: '',
    discountPrice: '',
    category: 'jee',
    subject: 'Physics',
    level: 'intermediate',
    language: 'Hindi & English',
    isPublished: true,
  });

  // New Lesson Form State
  const [newLesson, setNewLesson] = useState({
    title: '',
    description: '',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnailUrl: '',
    duration: '45',
    isPreview: false,
  });

  // Course Edit & Delete UI States
  const [showEditCourseModal, setShowEditCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  // Lesson Upload progress states
  const [videoUploading, setVideoUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [lessonThumbnailUploading, setLessonThumbnailUploading] = useState(false);

  // Messages chat simulator
  const [activeChat, setActiveChat] = useState(0);
  const [chatInput, setChatInput] = useState('');
  const [chats, setChats] = useState([]);

  // Real data integration states
  const [stats, setStats] = useState({
    courseCount: 0,
    totalStudents: 0,
    totalEarnings: 0,
    assignmentsCount: 0
  });
  const [assignments, setAssignments] = useState([]);
  const [studentsList, setStudentsList] = useState([]);
  const [tests, setTests] = useState([]);
  
  // Modals & UI States
  const [showTestModal, setShowTestModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedAssignmentForGrading, setSelectedAssignmentForGrading] = useState(null);

  // New Assignment Form State
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    courseId: '',
    dueDate: '',
    totalMarks: '100'
  });

  // New MCQ Test Form State
  const [newTest, setNewTest] = useState({
    title: '',
    description: '',
    courseId: '',
    duration: '60',
    testType: 'chapter',
    category: 'jee',
    questions: [
      {
        text: '',
        options: [
          { label: 'A', text: '' },
          { label: 'B', text: '' },
          { label: 'C', text: '' },
          { label: 'D', text: '' }
        ],
        correctOption: 'A',
        marks: 4,
        negativeMark: 1,
        difficulty: 'medium',
        topic: ''
      }
    ]
  });

  // Attendance management states
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceCourse, setAttendanceCourse] = useState('');
  const [attendanceRoster, setAttendanceRoster] = useState([]);

  // Live classes scheduled
  const [liveSessions, setLiveSessions] = useState([]);
  const [recordingUrl, setRecordingUrl] = useState(null);
  const [newLiveSession, setNewLiveSession] = useState({
    title: '',
    course: '',
    date: '',
    time: '',
    duration: '60'
  });

  // Study materials list
  const [materials, setMaterials] = useState([]);
  const [newMaterial, setNewMaterial] = useState({
    title: '',
    course: '',
    type: 'PDF',
    size: '1.2 MB'
  });
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  // Announcements list (timeline)
  const [announcements, setAnnouncements] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    course: ''
  });

  // Grading form state
  const [gradingState, setGradingState] = useState({
    studentId: '',
    studentName: '',
    assignmentId: '',
    grade: '',
    feedback: ''
  });

  // Derive all submissions from all assignments dynamically
  const allSubmissions = useMemo(() => {
    const all = [];
    assignments.forEach(asg => {
      (asg.submissions || []).forEach((sub, idx) => {
        all.push({
          id: sub._id || (sub.student?._id ? `${sub.student._id}-${asg._id}` : `sub-${asg._id}-${idx}`),
          studentId: sub.student?._id || '',
          name: sub.student?.name || 'Anonymous Student',
          email: sub.student?.email || '',
          assignment: asg.title,
          assignmentId: asg._id,
          time: sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : 'N/A',
          status: sub.isGraded ? 'Graded' : 'Submitted',
          grade: sub.grade,
          feedback: sub.feedback,
          fileUrl: sub.fileUrl,
          comment: sub.comment
        });
      });
    });
    return all;
  }, [assignments]);

  // Derive submissions for the selected assignment dynamically
  const dynamicSubmissions = useMemo(() => {
    if (!selectedAssignmentForGrading) return [];
    const currentAsg = assignments.find(a => a._id === selectedAssignmentForGrading._id) || selectedAssignmentForGrading;
    return (currentAsg.submissions || []).map((sub, idx) => ({
      id: sub._id || sub.student?._id || `submission-${idx}`,
      studentId: sub.student?._id || '',
      name: sub.student?.name || 'Anonymous Student',
      email: sub.student?.email || '',
      assignment: currentAsg.title,
      assignmentId: currentAsg._id,
      time: sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : 'N/A',
      status: sub.isGraded ? 'Graded' : 'Submitted',
      grade: sub.grade,
      feedback: sub.feedback,
      fileUrl: sub.fileUrl,
      comment: sub.comment
    }));
  }, [assignments, selectedAssignmentForGrading]);

  const avgClassScore = useMemo(() => {
    const graded = allSubmissions.filter(s => s.status === 'Graded');
    if (graded.length === 0) return 'N/A';
    const totalGrade = graded.reduce((sum, s) => sum + Number(s.grade), 0);
    const totalPossible = graded.reduce((sum, s) => {
      const asg = assignments.find(a => a._id === s.assignmentId);
      return sum + (asg ? Number(asg.totalMarks) : 100);
    }, 0);
    if (totalPossible === 0) return 'N/A';
    return `${Math.round((totalGrade / totalPossible) * 100)}%`;
  }, [allSubmissions, assignments]);

  const avgAttendance = useMemo(() => {
    if (attendanceRoster.length === 0) return 'N/A';
    const presentCount = attendanceRoster.filter(r => r.present).length;
    return `${Math.round((presentCount / attendanceRoster.length) * 100)}%`;
  }, [attendanceRoster]);

  const avgCourseCompletion = useMemo(() => {
    if (courses.length === 0) return '0%';
    const sum = courses.reduce((acc, curr) => acc + (curr.progressPercent || 0), 0);
    return `${Math.round(sum / courses.length)}%`;
  }, [courses]);

  const activeStudentsRatio = useMemo(() => {
    if (studentsList.length === 0) return 'N/A';
    const activeCount = studentsList.filter(s => s.active !== false).length;
    return `${Math.round((activeCount / studentsList.length) * 100)}%`;
  }, [studentsList]);

  useEffect(() => {
    fetchTeacherData();
  }, []);

  // Prevent teacher from accessing messages page
  useEffect(() => {
    if (activeTab === 'messages') {
      setActiveTab('dashboard');
    }
  }, [activeTab]);

  useEffect(() => {
    if (studentsList && studentsList.length > 0) {
      setAttendanceRoster(
        studentsList.map((stu, idx) => ({
          id: stu._id || idx,
          name: stu.name || 'Anonymous Student',
          email: stu.email || '',
          present: true
        }))
      );
    } else {
      setAttendanceRoster([]);
    }
  }, [studentsList]);

  async function fetchTeacherData() {
    setLoading(true);
    try {
      const res = await api.get('/dashboard/teacher');
      if (res.data.success) {
        setCourses(res.data.courses || []);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
        if (res.data.assignments) {
          setAssignments(res.data.assignments);
          if (res.data.assignments.length > 0) {
            setSelectedAssignmentForGrading(res.data.assignments[0]);
          }
        }
        if (res.data.recentStudents) {
          setStudentsList(res.data.recentStudents);
        }
        if (res.data.liveClasses) {
          setLiveSessions(res.data.liveClasses);
        }
      }

      // Fetch tests/quizzes
      const testRes = await api.get('/tests');
      if (testRes.data.success) {
        setTests(testRes.data.tests || []);
      }
    } catch (e) {
      console.error("Teacher dashboard fetch error:", e);
      setCourses([]);
      setStats({
        courseCount: 0,
        totalStudents: 0,
        totalEarnings: 0,
        assignmentsCount: 0
      });
      setAssignments([]);
      setSelectedAssignmentForGrading(null);
      setStudentsList([]);
      setTests([]);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/courses', {
        ...newCourse,
        price: Number(newCourse.price),
        discountPrice: Number(newCourse.discountPrice),
      });
      if (res.data.success) {
        alert('Course created successfully!');
        setShowCourseModal(false);
        setNewCourse({
          title: '',
          description: '',
          shortDescription: '',
          price: '',
          discountPrice: '',
          category: 'jee',
          subject: 'Physics',
          level: 'intermediate',
          language: 'Hindi & English',
          isPublished: true,
        });
        fetchTeacherData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create course');
    }
  };

  const openEditCourseModal = (course) => {
    setEditingCourse({
      _id: course._id,
      title: course.title || '',
      description: course.description || '',
      shortDescription: course.shortDescription || '',
      price: course.price || '',
      discountPrice: course.discountPrice || '',
      category: course.category || 'jee',
      subject: course.subject || 'Physics',
      level: course.level || 'intermediate',
      language: course.language || 'Hindi & English',
      isPublished: course.isPublished !== undefined ? course.isPublished : true,
      lessons: course.lessons || [],
    });
    setShowEditCourseModal(true);
  };

  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/courses/${editingCourse._id}`, {
        ...editingCourse,
        price: Number(editingCourse.price),
        discountPrice: Number(editingCourse.discountPrice),
      });
      if (res.data.success) {
        alert('Course updated successfully!');
        setShowEditCourseModal(false);
        setEditingCourse(null);
        fetchTeacherData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update course');
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course? This action cannot be undone and will delete all associated lectures/data.")) return;
    try {
      const res = await api.delete(`/courses/${courseId}`);
      if (res.data.success) {
        alert('Course deleted successfully!');
        fetchTeacherData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete course');
    }
  };

  const handleDeleteLessonFromEdit = async (lessonId) => {
    if (!window.confirm("Are you sure you want to delete this lecture?")) return;
    const updatedLessons = editingCourse.lessons.filter((l) => l._id !== lessonId);
    try {
      const res = await api.put(`/courses/${editingCourse._id}`, {
        ...editingCourse,
        price: Number(editingCourse.price),
        discountPrice: Number(editingCourse.discountPrice),
        lessons: updatedLessons,
      });
      if (res.data.success) {
        alert('Lecture deleted from syllabus.');
        setEditingCourse({
          ...editingCourse,
          lessons: updatedLessons,
        });
        fetchTeacherData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete lecture');
    }
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setVideoUploading(true);
    setUploadProgress(0);

    try {
      // 1. Attempt to get Cloudinary signature
      let signatureData = null;
      try {
        const signRes = await api.get('/uploads/sign');
        if (signRes.data.success) {
          signatureData = signRes.data;
        }
      } catch (err) {
        console.log("Cloudinary signing is unconfigured or failed, falling back to local storage upload.", err.message);
      }

      if (signatureData) {
        // 2. Direct upload to Cloudinary
        const { signature, timestamp, cloudName, apiKey, folder } = signatureData;
        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', apiKey);
        formData.append('timestamp', timestamp);
        formData.append('signature', signature);
        formData.append('folder', folder);

        const res = await axios.post(
          `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
          formData,
          {
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(percentCompleted);
            },
          }
        );

        if (res.data.secure_url) {
          setNewLesson((prev) => ({
            ...prev,
            videoUrl: res.data.secure_url,
          }));
          alert('Video uploaded directly to Cloudinary successfully!');
        }
      } else {
        // 3. Fallback to Local Server Upload
        const formData = new FormData();
        formData.append('file', file);

        const res = await api.post('/uploads/file', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          },
        });

        if (res.data.success) {
          setNewLesson((prev) => ({
            ...prev,
            videoUrl: res.data.url,
          }));
          alert('Video uploaded to local server successfully!');
        }
      }
    } catch (err) {
      console.error("Upload error details:", err);
      alert(err.response?.data?.message || 'Failed to upload video');
    } finally {
      setVideoUploading(false);
      setUploadProgress(0);
    }
  };

  const handleThumbnailUpload = async (e, isEdit = false) => {
    const file = e.target.files[0];
    if (!file) return;

    setThumbnailUploading(true);

    try {
      // 1. Attempt to get Cloudinary signature
      let signatureData = null;
      try {
        const signRes = await api.get('/uploads/sign');
        if (signRes.data.success) {
          signatureData = signRes.data;
        }
      } catch (err) {
        console.log("Cloudinary signing is unconfigured or failed, falling back to local storage upload.", err.message);
      }

      if (signatureData) {
        // 2. Direct upload to Cloudinary (image)
        const { signature, timestamp, cloudName, apiKey, folder } = signatureData;
        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', apiKey);
        formData.append('timestamp', timestamp);
        formData.append('signature', signature);
        formData.append('folder', folder);

        const res = await axios.post(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          formData
        );

        if (res.data.secure_url) {
          const thumbnailData = {
            public_id: res.data.public_id || '',
            url: res.data.secure_url
          };
          if (isEdit) {
            setEditingCourse((prev) => ({
              ...prev,
              thumbnail: thumbnailData,
            }));
          } else {
            setNewCourse((prev) => ({
              ...prev,
              thumbnail: thumbnailData,
            }));
          }
          alert('Thumbnail uploaded directly to Cloudinary successfully!');
        }
      } else {
        // 3. Fallback to Local Server Upload
        const formData = new FormData();
        formData.append('file', file);

        const res = await api.post('/uploads/file', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        });

        if (res.data.success) {
          const thumbnailData = {
            public_id: '',
            url: res.data.url
          };
          if (isEdit) {
            setEditingCourse((prev) => ({
              ...prev,
              thumbnail: thumbnailData,
            }));
          } else {
            setNewCourse((prev) => ({
              ...prev,
              thumbnail: thumbnailData,
            }));
          }
          alert('Thumbnail uploaded to local server successfully!');
        }
      }
    } catch (err) {
      console.error("Thumbnail upload error details:", err);
      alert(err.response?.data?.message || 'Failed to upload thumbnail');
    } finally {
      setThumbnailUploading(false);
    }
  };

  const handleLessonThumbnailUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLessonThumbnailUploading(true);

    try {
      // 1. Attempt to get Cloudinary signature
      let signatureData = null;
      try {
        const signRes = await api.get('/uploads/sign');
        if (signRes.data.success) {
          signatureData = signRes.data;
        }
      } catch (err) {
        console.log("Cloudinary signing is unconfigured or failed, falling back to local storage upload.", err.message);
      }

      if (signatureData) {
        // 2. Direct upload to Cloudinary (image)
        const { signature, timestamp, cloudName, apiKey, folder } = signatureData;
        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', apiKey);
        formData.append('timestamp', timestamp);
        formData.append('signature', signature);
        formData.append('folder', folder);

        const res = await axios.post(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          formData
        );

        if (res.data.secure_url) {
          setNewLesson((prev) => ({
            ...prev,
            thumbnailUrl: res.data.secure_url,
          }));
          alert('Lecture thumbnail uploaded directly to Cloudinary successfully!');
        }
      } else {
        // 3. Fallback to Local Server Upload
        const formData = new FormData();
        formData.append('file', file);

        const res = await api.post('/uploads/file', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        });

        if (res.data.success) {
          setNewLesson((prev) => ({
            ...prev,
            thumbnailUrl: res.data.url,
          }));
          alert('Lecture thumbnail uploaded to local server successfully!');
        }
      }
    } catch (err) {
      console.error("Lecture thumbnail upload error details:", err);
      alert(err.response?.data?.message || 'Failed to upload lecture thumbnail');
    } finally {
      setLessonThumbnailUploading(false);
    }
  };

  const handleAddLesson = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/courses/${activeCourseId}/lessons`, {
        ...newLesson,
        duration: Number(newLesson.duration),
      });
      if (res.data.success) {
        alert('Lesson added successfully!');
        setShowLessonModal(false);
        setNewLesson({
          title: '',
          description: '',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          thumbnailUrl: '',
          duration: '45',
          isPreview: false,
        });
        fetchTeacherData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add lesson');
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!newAssignment.courseId) {
      alert("Please select a course");
      return;
    }
    try {
      const res = await api.post('/assignments', {
        title: newAssignment.title,
        description: newAssignment.description,
        courseId: newAssignment.courseId,
        dueDate: newAssignment.dueDate,
        totalMarks: Number(newAssignment.totalMarks)
      });
      if (res.data.success) {
        alert('Assignment created successfully!');
        setShowAssignmentModal(false);
        setNewAssignment({
          title: '',
          description: '',
          courseId: '',
          dueDate: '',
          totalMarks: '100'
        });
        fetchTeacherData();
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to create assignment');
    }
  };

  const handleCreateTest = async (e) => {
    e.preventDefault();
    if (!newTest.courseId) {
      alert("Please select a course");
      return;
    }
    try {
      const res = await api.post('/tests', {
        title: newTest.title,
        description: newTest.description,
        courseId: newTest.courseId,
        duration: Number(newTest.duration),
        testType: newTest.testType,
        category: newTest.category,
        questions: newTest.questions
      });
      if (res.data.success) {
        alert('MCQ test published successfully!');
        setShowTestModal(false);
        setNewTest({
          title: '',
          description: '',
          courseId: '',
          duration: '60',
          testType: 'chapter',
          category: 'jee',
          questions: [
            { text: '', options: [{ label: 'A', text: '' }, { label: 'B', text: '' }, { label: 'C', text: '' }, { label: 'D', text: '' }], correctOption: 'A', marks: 4, negativeMark: 1 }
          ]
        });
        fetchTeacherData();
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to publish MCQ test');
    }
  };

  const handleGradeSubmission = async (e) => {
    e.preventDefault();
    if (!gradingState.assignmentId || !gradingState.studentId) return;
    try {
      const res = await api.put(`/assignments/${gradingState.assignmentId}/grade`, {
        studentId: gradingState.studentId,
        grade: Number(gradingState.grade),
        feedback: gradingState.feedback
      });
      if (res.data.success) {
        alert('Grade saved successfully!');
        setGradingState({ studentId: '', studentName: '', assignmentId: '', grade: '', feedback: '' });
        fetchTeacherData();
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to save grade');
    }
  };

  const handleSaveAttendance = (e) => {
    e.preventDefault();
    alert(`Attendance marked successfully for ${attendanceCourse || 'Physics Batch'} on ${attendanceDate}!`);
  };

  const handleCreateLiveSession = async (e) => {
    e.preventDefault();
    if (!newLiveSession.title || !newLiveSession.course) {
      alert("Please fill all live stream details");
      return;
    }
    try {
      const res = await api.post('/live-classes', {
        title: newLiveSession.title,
        course: newLiveSession.course,
        date: newLiveSession.date,
        time: newLiveSession.time,
        duration: Number(newLiveSession.duration) || 60
      });
      if (res.data.success) {
        alert("Live lecture room scheduled!");
        setNewLiveSession({ title: '', course: '', date: '', time: '', duration: '60' });
        fetchTeacherData();
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to schedule live room');
    }
  };

  const handleDeleteLiveSession = async (sessionId) => {
    if (!window.confirm("Are you sure you want to cancel and delete this scheduled live class room?")) return;
    try {
      const res = await api.delete(`/live-classes/${sessionId}`);
      if (res.data.success) {
        alert("Live lecture room cancelled!");
        fetchTeacherData();
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to delete live room');
    }
  };

  const handleFile = (file) => {
    setSelectedFile(file);
    let sizeStr = '0 KB';
    if (file.size >= 1024 * 1024) {
      sizeStr = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
    } else {
      sizeStr = `${(file.size / 1024).toFixed(0)} KB`;
    }
    let detectedType = 'PDF';
    const ext = file.name.split('.').pop().toLowerCase();
    if (['mp4', 'mkv', 'avi', 'mov', 'webm'].includes(ext)) {
      detectedType = 'Video';
    } else if (['doc', 'docx', 'txt', 'rtf', 'odt'].includes(ext)) {
      detectedType = 'Document';
    } else if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext)) {
      detectedType = 'Image';
    }
    setNewMaterial(prev => ({
      ...prev,
      title: prev.title || file.name.substring(0, file.name.lastIndexOf('.')) || file.name,
      size: sizeStr,
      type: detectedType
    }));
  };

  const handleCreateMaterial = (e) => {
    e.preventDefault();
    if (!newMaterial.title || !newMaterial.course) {
      alert("Please fill in file information");
      return;
    }
    if (!selectedFile) {
      alert("Please select a file to upload");
      return;
    }
    setMaterials([
      ...materials,
      {
        id: Date.now(),
        title: newMaterial.title,
        course: newMaterial.course,
        type: newMaterial.type,
        size: newMaterial.size,
        url: URL.createObjectURL(selectedFile)
      }
    ]);
    alert("Reference material uploaded!");
    setNewMaterial({ title: '', course: '', type: 'PDF', size: '1.2 MB' });
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCreateAnnouncement = (e) => {
    e.preventDefault();
    if (!newAnnouncement.title || !newAnnouncement.content) {
      alert("Announcement title and details are required");
      return;
    }
    setAnnouncements([
      {
        id: Date.now(),
        title: newAnnouncement.title,
        content: newAnnouncement.content,
        course: newAnnouncement.course || 'All Batches',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      },
      ...announcements
    ]);
    alert("Announcement published to student dashboard feeds!");
    setNewAnnouncement({ title: '', content: '', course: '' });
  };

  const openLessonModal = (courseId) => {
    setActiveCourseId(courseId);
    setShowLessonModal(true);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const updatedChats = [...chats];
    const messageTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    updatedChats[activeChat].messages.push({
      sender: 'teacher',
      text: chatInput,
      time: messageTime
    });

    setChats(updatedChats);
    setChatInput('');

    // Simulate reply
    setTimeout(() => {
      const repliedChats = [...chats];
      repliedChats[activeChat].messages.push({
        sender: 'student',
        text: "Thank you, Sir! I will verify this immediately.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      setChats(repliedChats);
    }, 1200);
  };

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  // Math totals
  const totalRevenue = courses.reduce((sum, c) => sum + (c.totalEnrolled || 0) * (c.discountPrice || c.price || 0), 0);
  const totalStudents = courses.reduce((sum, c) => sum + (c.totalEnrolled || 0), 0);

  // Sidebar navigation items
  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'courses', label: 'My Courses', icon: BookOpen },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'assignments', label: 'Assignments', icon: FileText },
    { id: 'attendance', label: 'Attendance', icon: UserCheck },
    { id: 'live', label: 'Live Classes', icon: Video },
    { id: 'materials', label: 'Study Materials', icon: FolderOpen },
    { id: 'quizzes', label: 'Tests & Quizzes', icon: Award },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'earnings', label: 'Earnings', icon: CircleDollarSign },
    { id: 'reports', label: 'Reports', icon: FileSpreadsheet },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // Filter courses based on search
  const filteredCourses = courses.filter(c => 
    c.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.subject?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#090040] text-white relative font-sans">
      {/* Background glow graphics */}
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
                    <span className="bg-brand-pink text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
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
                placeholder="Search students, courses, content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-brand-dark/50 border border-brand-purple/15 rounded-full pl-10 pr-4 py-2 text-sm text-white placeholder-brand-textMuted/60 focus:outline-none focus:border-brand-pink focus:ring-1 focus:ring-brand-pink transition-all w-36 min-[375px]:w-44 sm:w-64 md:w-80"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Notification center */}
            <div className="relative">
              <button className="p-2 text-brand-textMuted hover:text-white rounded-full hover:bg-white/5 transition-all relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-brand-pink text-white rounded-full text-[9px] font-black flex items-center justify-center">
                  6
                </span>
              </button>
            </div>

            {/* Profile Menu Dropdown */}
            <div className="relative">
              <button
                onClick={() => setHeaderDropdownOpen(!headerDropdownOpen)}
                className="flex items-center gap-2 sm:gap-3 bg-transparent sm:bg-brand-surface/40 hover:sm:bg-brand-surface/70 sm:border sm:border-brand-purple/15 sm:pl-2 sm:pr-3 sm:py-1.5 rounded-full text-white font-semibold transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-brand-purple/30 border border-brand-purple/40 flex items-center justify-center text-sm font-black text-white uppercase shadow-md shadow-brand-purple/10 shrink-0">
                  {teacherName.charAt(0)}
                </div>
                <div className="hidden sm:flex flex-col text-left shrink-0">
                  <span className="text-xs font-bold leading-tight block">{teacherName}</span>
                  <span className="text-[9px] text-brand-textMuted leading-none block uppercase font-bold tracking-wider">Physics Teacher</span>
                </div>
                <ChevronDown className="hidden sm:inline w-3.5 h-3.5 text-brand-textMuted shrink-0" />
              </button>

              {headerDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setHeaderDropdownOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-brand-surface border border-brand-purple/20 p-2 shadow-2xl z-40 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-3 py-2 border-b border-white/5 mb-1.5">
                      <p className="text-[10px] font-bold text-brand-pink uppercase tracking-widest leading-none">Registered Email</p>
                      <p className="text-xs font-semibold text-white truncate mt-1">{teacherEmail}</p>
                    </div>
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

        {/* Scrollable Main viewport */}
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="min-h-full flex flex-col justify-between">
            <div className="p-4 sm:p-6 lg:p-8 space-y-8">

              {/* TAB 1: TEACHER DASHBOARD OVERVIEW */}
              {activeTab === 'dashboard' && (
                <div className="space-y-8 text-left animate-in fade-in duration-300">
                  {/* Welcome banner */}
                  <div className="bg-gradient-to-r from-brand-violet to-[#140c5c] rounded-3xl p-6 sm:p-8 border border-brand-purple/15 relative overflow-hidden shadow-xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-pink/5 blur-3xl rounded-full pointer-events-none"></div>
                    <div className="space-y-1">
                      <h1 className="text-2xl sm:text-3xl font-black text-white">Welcome back, {teacherName}! 👋</h1>
                      <p className="text-brand-textMuted text-sm">Here's what's happening in your classes today.</p>
                    </div>
                  </div>

                  {/* 5 Stats Cards Row */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    
                    {/* Card 1: Total Students */}
                    <div className="glass-card p-5 rounded-2xl border border-brand-purple/15 flex flex-col justify-between h-[130px]">
                      <div className="w-8 h-8 rounded-lg bg-brand-pink/15 flex items-center justify-center text-brand-pink shrink-0">
                        <Users className="w-4 h-4" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-brand-textMuted font-bold uppercase tracking-wider block">Total Students</span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl font-black text-white">{stats.totalStudents}</span>
                          <span className="text-[9px] text-brand-pink font-bold flex items-center gap-0.5"><ArrowUp className="w-2.5 h-2.5" />12.4%</span>
                        </div>
                        <span className="text-[8px] text-brand-textMuted block">vs last month</span>
                      </div>
                    </div>

                    {/* Card 2: Active Courses */}
                    <div className="glass-card p-5 rounded-2xl border border-brand-purple/15 flex flex-col justify-between h-[130px]">
                      <div className="w-8 h-8 rounded-lg bg-brand-purple/15 flex items-center justify-center text-brand-purple shrink-0">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-brand-textMuted font-bold uppercase tracking-wider block">Active Courses</span>
                        <span className="text-xl font-black text-white block">{courses.length}</span>
                        <button onClick={() => setActiveTab('courses')} className="text-[8px] text-brand-purple font-black hover:underline text-left">
                          View all courses →
                        </button>
                      </div>
                    </div>

                    {/* Card 3: Pending Assignments */}
                    <div className="glass-card p-5 rounded-2xl border border-brand-purple/15 flex flex-col justify-between h-[130px]">
                      <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-400 shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-brand-textMuted font-bold uppercase tracking-wider block">Pending Assignments</span>
                        <span className="text-xl font-black text-white block">{assignments.length}</span>
                        <button onClick={() => setActiveTab('assignments')} className="text-[8px] text-yellow-400 font-black hover:underline text-left">
                          View all assignments →
                        </button>
                      </div>
                    </div>

                    {/* Card 4: Upcoming Classes */}
                    <div className="glass-card p-5 rounded-2xl border border-brand-purple/15 flex flex-col justify-between h-[130px]">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center text-blue-400 shrink-0">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-brand-textMuted font-bold uppercase tracking-wider block">Upcoming Classes</span>
                        <span className="text-xl font-black text-white block">{liveSessions.length}</span>
                        <span className="text-[8px] text-blue-400 font-bold block">Today</span>
                      </div>
                    </div>

                    {/* Card 5: Total Earnings */}
                    <div className="glass-card p-5 rounded-2xl border border-brand-purple/15 flex flex-col justify-between h-[130px]">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                        <CircleDollarSign className="w-4 h-4" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-brand-textMuted font-bold uppercase tracking-wider block">Total Earnings</span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl font-black text-white">₹{stats.totalEarnings.toLocaleString()}</span>
                        </div>
                        <span className="text-[8px] text-brand-textMuted block">Lifetime</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle row widgets: schedule, performance overview line chart, upcoming classes */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Today's Schedule */}
                    <div className="glass-card rounded-2xl border border-brand-purple/10 p-5 lg:col-span-5 text-left flex flex-col justify-between">
                      <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4">
                        <h3 className="font-extrabold text-white text-sm">Today's Schedule</h3>
                        <button onClick={() => setActiveTab('live')} className="text-[10px] text-brand-pink font-bold hover:underline">
                          View full calendar
                        </button>
                      </div>

                      <div className="space-y-3">
                        {(() => {
                          const todayStr = new Date().toISOString().split('T')[0];
                          const todaySessions = liveSessions.filter(s => s.date === todayStr);
                          const scheduleColors = ['brand-pink', 'yellow-500', 'brand-purple', 'blue-400', 'emerald-400'];
                          if (todaySessions.length === 0) {
                            return (
                              <div className="text-center py-6 text-brand-textMuted text-xs italic">
                                No classes scheduled for today.
                              </div>
                            );
                          }
                          return todaySessions.map((session, idx) => {
                            const color = scheduleColors[idx % scheduleColors.length];
                            const courseName = typeof session.course === 'object' ? session.course?.title : session.course;
                            return (
                              <div key={session._id} className="flex items-center justify-between bg-brand-surface/20 p-2.5 rounded-xl border border-white/5">
                                <div className="flex items-center gap-3">
                                  <div className="text-left shrink-0">
                                    <span className={`text-[10px] text-${color} font-black block`}>{session.time}</span>
                                    <span className="text-[9px] text-brand-textMuted block">{session.duration} mins</span>
                                  </div>
                                  <div className={`w-[1.5px] h-6 bg-${color} shrink-0`}></div>
                                  <div className="text-left">
                                    <h5 className="text-xs font-bold text-white">{session.title}</h5>
                                    <p className="text-[9px] text-brand-textMuted">{courseName}</p>
                                  </div>
                                </div>
                                <button onClick={() => navigate(`/meeting/${session.meetingId}`)} className="bg-brand-pink text-white text-[10px] font-bold px-2.5 py-1 rounded hover:opacity-90">Join Class</button>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>

                    {/* Student Performance Chart */}
                    <div className="glass-card rounded-2xl border border-brand-purple/10 p-5 lg:col-span-4 text-left flex flex-col justify-between">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-3">
                        <div>
                          <h3 className="font-extrabold text-white text-sm">Student Performance Overview</h3>
                        </div>
                        <select className="bg-brand-dark/40 border border-brand-purple/20 text-[9px] text-white rounded p-1">
                          <option>This Month</option>
                        </select>
                      </div>

                      {/* Legends */}
                      <div className="grid grid-cols-3 gap-2 text-center pb-2">
                        <div className="text-left">
                          <span className="text-[8px] text-brand-textMuted block">Avg Attendance</span>
                          <span className="text-xs font-black text-white">87% <span className="text-[8px] text-emerald-400 font-bold">+8%</span></span>
                        </div>
                        <div className="text-left">
                          <span className="text-[8px] text-brand-textMuted block">Avg Assignment</span>
                          <span className="text-xs font-black text-white">76% <span className="text-[8px] text-emerald-400 font-bold">+5%</span></span>
                        </div>
                        <div className="text-left">
                          <span className="text-[8px] text-brand-textMuted block">Test Avg Score</span>
                          <span className="text-xs font-black text-white">72% <span className="text-[8px] text-emerald-400 font-bold">+6%</span></span>
                        </div>
                      </div>

                      {/* SVG line chart */}
                      <div className="h-40">
                        <svg viewBox="0 0 100 50" className="w-full h-full">
                          {/* Grid Lines */}
                          <line x1="10" y1="10" x2="95" y2="10" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                          <line x1="10" y1="20" x2="95" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                          <line x1="10" y1="30" x2="95" y2="30" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                          <line x1="10" y1="40" x2="95" y2="40" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />

                          {/* Line 1: Attendance (purple) */}
                          <path d="M 10 22 L 30 18 L 50 20 L 70 15 L 95 12" fill="none" stroke="#B13BFF" strokeWidth="1.2" />
                          {/* Line 2: Assignment Score (blue) */}
                          <path d="M 10 32 L 30 26 L 50 28 L 70 21 L 95 18" fill="none" stroke="#3b82f6" strokeWidth="1.2" />
                          {/* Line 3: Test score (green) */}
                          <path d="M 10 40 L 30 38 L 50 35 L 70 32 L 95 30" fill="none" stroke="#10b981" strokeWidth="1.2" />
                        </svg>
                      </div>

                      {/* Legend label indicator */}
                      <div className="flex justify-around items-center text-[7px] text-brand-textMuted uppercase font-bold pt-2 border-t border-white/5">
                        <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-brand-purple"></span> Attendance %</div>
                        <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Assignment %</div>
                        <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Test Score %</div>
                      </div>
                    </div>

                    {/* Upcoming Classes */}
                    <div className="glass-card rounded-2xl border border-brand-purple/10 p-5 lg:col-span-3 text-left flex flex-col justify-between">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-3">
                        <h3 className="font-extrabold text-white text-sm">Upcoming Classes</h3>
                        <button onClick={() => setActiveTab('live')} className="text-[10px] text-brand-pink font-bold hover:underline">View Calendar</button>
                      </div>

                      <div className="space-y-3.5 flex-grow flex flex-col justify-between">
                        <div className="flex items-center justify-between text-xs">
                          <div>
                            <span className="text-[10px] text-brand-pink font-bold block">Today, 10:00 AM</span>
                            <span className="text-[8px] text-brand-textMuted block">Physics - Electrostatics</span>
                          </div>
                          <button onClick={() => alert("Launching Class...")} className="bg-brand-dark hover:bg-brand-pink/15 border border-brand-purple/20 text-[9px] font-bold px-2 py-0.5 rounded text-gray-200">Join</button>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <div>
                            <span className="text-[10px] text-yellow-500 font-bold block">Today, 02:00 PM</span>
                            <span className="text-[8px] text-brand-textMuted block">Current Electricity</span>
                          </div>
                          <button onClick={() => alert("Launching Class...")} className="bg-brand-dark hover:bg-brand-pink/15 border border-brand-purple/20 text-[9px] font-bold px-2 py-0.5 rounded text-gray-200">Join</button>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <div>
                            <span className="text-[10px] text-emerald-400 font-bold block">Tomorrow, 11:00 AM</span>
                            <span className="text-[8px] text-brand-textMuted block">Moving Charges & Magnetism</span>
                          </div>
                          <button onClick={() => alert("Launching Class...")} className="bg-brand-dark hover:bg-brand-pink/15 border border-brand-purple/20 text-[9px] font-bold px-2 py-0.5 rounded text-gray-200">Join</button>
                        </div>
                      </div>

                      <button onClick={() => setActiveTab('live')} className="w-full flex items-center justify-center gap-0.5 text-[9px] text-brand-pink font-bold hover:underline border-t border-white/5 pt-2 mt-2">
                        View all classes <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                  </div>

                  {/* Third row: pending assignments list, courses list, announcements */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Pending Assignments */}
                    <div className="glass-card rounded-2xl border border-brand-purple/10 p-5 lg:col-span-4 text-left flex flex-col justify-between">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-3">
                        <h3 className="font-extrabold text-white text-sm">Pending Assignments</h3>
                        <button onClick={() => setActiveTab('assignments')} className="text-[10px] text-brand-pink font-bold hover:underline">View all</button>
                      </div>

                      <div className="space-y-3.5 flex-grow flex flex-col justify-between">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-purple"></span>
                            <div className="text-left">
                              <h5 className="text-[10px] font-bold text-white leading-tight">Electrostatics Problem Set</h5>
                              <span className="text-[8px] text-brand-textMuted">JEE Advanced 2025 Batch</span>
                            </div>
                          </div>
                          <span className="bg-brand-purple/10 text-brand-purple text-[9px] font-black px-2 py-0.5 rounded">24 Pending</span>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                            <div className="text-left">
                              <h5 className="text-[10px] font-bold text-white leading-tight">Current Electricity Worksheet</h5>
                              <span className="text-[8px] text-brand-textMuted">JEE Main 2025 Batch</span>
                            </div>
                          </div>
                          <span className="bg-yellow-500/10 text-yellow-400 text-[9px] font-black px-2 py-0.5 rounded">18 Pending</span>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            <div className="text-left">
                              <h5 className="text-[10px] font-bold text-white leading-tight">Magnetism Numericals</h5>
                              <span className="text-[8px] text-brand-textMuted">Class 12 Physics</span>
                            </div>
                          </div>
                          <span className="bg-emerald-500/10 text-emerald-400 text-[9px] font-black px-2 py-0.5 rounded">10 Pending</span>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                            <div className="text-left">
                              <h5 className="text-[10px] font-bold text-white leading-tight">Ray Optics Assignment</h5>
                              <span className="text-[8px] text-brand-textMuted">Class 12 Physics</span>
                            </div>
                          </div>
                          <span className="bg-red-500/10 text-red-400 text-[9px] font-black px-2 py-0.5 rounded">15 Pending</span>
                        </div>
                      </div>

                      <button onClick={() => setActiveTab('assignments')} className="w-full flex items-center justify-center gap-0.5 text-[9px] text-brand-pink font-bold hover:underline border-t border-white/5 pt-2 mt-2">
                        View all assignments <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    {/* My Courses */}
                    <div className="glass-card rounded-2xl border border-brand-purple/10 p-5 lg:col-span-5 text-left flex flex-col justify-between">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-3">
                        <h3 className="font-extrabold text-white text-sm">My Courses</h3>
                        <button onClick={() => setActiveTab('courses')} className="text-[10px] text-brand-pink font-bold hover:underline">Manage Courses</button>
                      </div>

                      <div className="space-y-3.5 flex-grow flex flex-col justify-between">
                        {courses.slice(0, 3).map((c) => (
                          <div key={c._id} className="flex items-center justify-between gap-3 bg-brand-surface/20 p-2.5 rounded-xl border border-white/5 hover:border-brand-purple/20 transition-all">
                            <div className="text-left min-w-0 flex-1">
                              <h5 className="text-xs font-bold text-white truncate">{c.title}</h5>
                              <span className="text-[9px] text-brand-textMuted">Students: {c.totalEnrolled || 120}</span>
                              <div className="w-full h-1 bg-brand-dark rounded-full overflow-hidden mt-1.5">
                                <div className="h-full bg-gradient-to-r from-brand-pink to-brand-purple" style={{ width: `${c.progressPercent || 70}%` }}></div>
                              </div>
                            </div>
                            <button onClick={() => { setActiveTab('courses'); openLessonModal(c._id); }} className="bg-brand-dark hover:bg-brand-purple/10 border border-brand-purple/20 text-[9px] font-black px-2.5 py-1 rounded text-brand-purple hover:text-white shrink-0">Manage</button>
                          </div>
                        ))}
                      </div>

                      <button onClick={() => setActiveTab('courses')} className="w-full flex items-center justify-center gap-0.5 text-[9px] text-brand-pink font-bold hover:underline border-t border-white/5 pt-2 mt-2">
                        View all courses <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Announcements */}
                    <div className="glass-card rounded-2xl border border-brand-purple/10 p-5 lg:col-span-3 text-left flex flex-col justify-between">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-3">
                        <h3 className="font-extrabold text-white text-sm">Announcements</h3>
                        <button onClick={() => alert("Create announcement modal")} className="text-[10px] text-brand-pink font-bold hover:underline">Create New</button>
                      </div>

                      <div className="space-y-3.5 flex-grow flex flex-col justify-between">
                        <div className="bg-brand-surface/30 p-2.5 rounded-xl border border-brand-purple/5 space-y-1">
                          <h5 className="text-[10px] font-bold text-white">Weekly Test on Electrostatics</h5>
                          <p className="text-[8px] text-brand-textMuted leading-relaxed">Test will be held on May 26, 2025 at 7:00 PM.</p>
                          <span className="text-[7px] text-brand-textMuted block">May 24, 2025</span>
                        </div>

                        <div className="bg-brand-surface/30 p-2.5 rounded-xl border border-brand-purple/5 space-y-1">
                          <h5 className="text-[10px] font-bold text-white">Class Timing Change</h5>
                          <p className="text-[8px] text-brand-textMuted leading-relaxed">Tomorrow's class will start at 11:30 AM.</p>
                          <span className="text-[7px] text-brand-textMuted block">May 23, 2025</span>
                        </div>
                      </div>

                      <button onClick={() => setActiveTab('announcements')} className="w-full flex items-center justify-center gap-0.5 text-[9px] text-brand-pink font-bold hover:underline border-t border-white/5 pt-2 mt-2">
                        View all announcements <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                  </div>

                  {/* Fourth Row: Submissions list, recent messages */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Recent Submissions */}
                    <div className="glass-card rounded-2xl border border-brand-purple/10 p-5 lg:col-span-8 text-left flex flex-col justify-between">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-3">
                        <h3 className="font-extrabold text-white text-sm">Recent Submissions</h3>
                        <button onClick={() => setActiveTab('assignments')} className="text-[10px] text-brand-pink font-bold hover:underline">View all</button>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full min-w-max text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-white/10 text-brand-pink font-bold uppercase tracking-wider pb-2">
                              <th className="py-2 whitespace-nowrap pr-4">Student Name</th>
                              <th className="py-2 whitespace-nowrap pr-4">Assignment</th>
                              <th className="py-2 whitespace-nowrap pr-4">Submitted On</th>
                              <th className="py-2 whitespace-nowrap pr-4">Status</th>
                              <th className="py-2 whitespace-nowrap text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 font-semibold text-gray-200">
                            {allSubmissions.length === 0 ? (
                              <tr>
                                <td colSpan="5" className="text-center py-4 text-brand-textMuted">No submissions received yet.</td>
                              </tr>
                            ) : (
                              allSubmissions.slice(0, 5).map((sub) => (
                                <tr key={sub.id} className="hover:bg-brand-surface/20 transition-all">
                                  <td className="py-2.5 font-bold text-white whitespace-nowrap pr-4">{sub.name}</td>
                                  <td className="py-2.5 whitespace-nowrap pr-4">{sub.assignment}</td>
                                  <td className="py-2.5 text-brand-textMuted whitespace-nowrap pr-4">{sub.time}</td>
                                  <td className="py-2.5 whitespace-nowrap pr-4">
                                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                                      sub.status === 'Graded'
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                        : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                    }`}>
                                      {sub.status}
                                    </span>
                                  </td>
                                  <td className="py-2.5 text-right whitespace-nowrap">
                                    <button 
                                      onClick={() => {
                                        const foundAsg = assignments.find(a => a._id === sub.assignmentId);
                                        if (foundAsg) {
                                          setSelectedAssignmentForGrading(foundAsg);
                                        }
                                        setActiveTab('assignments');
                                      }} 
                                      className="bg-brand-purple/10 border border-brand-purple/30 hover:bg-brand-purple/20 text-brand-purple hover:text-white px-2 py-1 rounded text-[9px] font-bold"
                                    >
                                      Review
                                    </button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Recent Messages */}
                    <div className="glass-card rounded-2xl border border-brand-purple/10 p-5 lg:col-span-4 text-left flex flex-col justify-between">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-3">
                        <h3 className="font-extrabold text-white text-sm">Recent Messages</h3>
                        <button onClick={() => setActiveTab('messages')} className="text-[10px] text-brand-pink font-bold hover:underline">View all</button>
                      </div>

                      <div className="space-y-3.5 flex-grow flex flex-col justify-between">
                        {chats.map((c, idx) => (
                          <div key={c.id} onClick={() => { setActiveTab('messages'); setActiveChat(idx); }} className="flex items-center justify-between gap-3 cursor-pointer group p-1.5 rounded-lg hover:bg-white/5 transition-all">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-pink to-brand-purple flex items-center justify-center text-xs font-black text-white shrink-0">
                                {c.avatar}
                              </div>
                              <div className="text-left min-w-0">
                                <h5 className="text-xs font-bold text-gray-200 group-hover:text-white truncate leading-tight">{c.studentName}</h5>
                                <p className="text-[9px] text-brand-textMuted truncate mt-1">
                                  {c.messages[c.messages.length - 1].text}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end shrink-0 gap-1.5">
                              <span className="text-[7px] text-brand-textMuted">{c.messages[c.messages.length - 1].time}</span>
                              {c.unread > 0 && (
                                <span className="w-4 h-4 rounded-full bg-brand-pink text-white text-[8px] font-bold flex items-center justify-center">
                                  {c.unread}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      <button onClick={() => setActiveTab('messages')} className="w-full flex items-center justify-center gap-0.5 text-[9px] text-brand-pink font-bold hover:underline border-t border-white/5 pt-2 mt-2">
                        Go to messages <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                  </div>

                </div>
              )}

              {/* TAB 2: MY COURSES VIEW (Original Course Management layout) */}
              {activeTab === 'courses' && (
                <div className="space-y-8 text-left animate-in fade-in duration-300">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-black text-white">Syllabus Batches & Course Panel</h1>
                      <p className="text-brand-textMuted text-sm">Upload study lectures, categories, and manage pricing outlines.</p>
                    </div>
                    <button
                      onClick={() => setShowCourseModal(true)}
                      className="btn-primary py-2.5 text-xs font-bold flex items-center gap-1.5 shadow-md"
                    >
                      <Plus className="w-4 h-4" /> Create Course
                    </button>
                  </div>

                  {/* Course Cards Grid */}
                  {loading ? (
                    <div className="flex justify-center items-center py-20">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-pink"></div>
                    </div>
                  ) : filteredCourses.length === 0 ? (
                    <div className="text-center py-16 bg-brand-surface/40 rounded-2xl border border-brand-purple/10 border-dashed">
                      <BookOpen className="w-12 h-12 text-brand-textMuted/40 mx-auto mb-3" />
                      <p className="text-brand-textMuted text-sm">No courses matching your filter.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredCourses.map((course) => (
                        <div key={course._id} className="glass-card rounded-2xl p-6 border border-brand-purple/15 flex flex-col justify-between hover:border-brand-purple/35 transition-all group">
                          <div className="space-y-4">
                            <div className="flex justify-between items-start gap-4 text-left">
                              <div>
                                <span className="bg-brand-pink/15 text-brand-pink text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border border-brand-pink/10">
                                  {course.category?.toUpperCase()}
                                </span>
                                {course.isPublished ? (
                                  <span className="bg-emerald-500/15 text-emerald-400 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border border-emerald-500/10 ml-2">
                                    Published
                                  </span>
                                ) : (
                                  <span className="bg-yellow-500/15 text-yellow-400 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border border-yellow-500/10 ml-2">
                                    Draft
                                  </span>
                                )}
                                <h3 className="text-base font-extrabold text-white mt-2 leading-snug group-hover:text-brand-pink transition-colors truncate max-w-[180px]" title={course.title}>
                                  {course.title}
                                </h3>
                              </div>
                              <div className="flex gap-1 shrink-0">
                                <button
                                  onClick={() => openEditCourseModal(course)}
                                  className="p-1.5 text-brand-textMuted hover:text-brand-pink hover:bg-white/5 rounded-lg transition-all"
                                  title="Edit Course"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteCourse(course._id)}
                                  className="p-1.5 text-brand-textMuted hover:text-red-400 hover:bg-white/5 rounded-lg transition-all"
                                  title="Delete Course"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2 text-center text-xs bg-brand-dark/45 p-3 rounded-xl border border-brand-purple/5 font-semibold text-gray-200">
                              <div>
                                <span className="text-brand-textMuted block text-[9px] uppercase font-bold">Students</span>
                                <span className="text-white font-black text-sm">{course.totalEnrolled || 0}</span>
                              </div>
                              <div>
                                <span className="text-brand-textMuted block text-[9px] uppercase font-bold">Lectures</span>
                                <span className="text-white font-black text-sm">{course.lessons?.length || 0}</span>
                              </div>
                              <div>
                                <span className="text-brand-textMuted block text-[9px] uppercase font-bold">Price</span>
                                <span className="text-white font-black text-sm">₹{course.discountPrice || course.price}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-3 mt-6 border-t border-white/5 pt-4">
                            <button
                              onClick={() => openLessonModal(course._id)}
                              className="flex-grow btn-secondary text-xs py-2 justify-center flex items-center gap-1.5"
                            >
                              <PlusCircle className="w-4 h-4" /> Add Lecture
                            </button>
                            <Link
                              to={`/courses/${course.slug}`}
                              className="btn-primary text-xs py-2 px-4 justify-center"
                            >
                              Preview <ChevronRight className="w-4 h-4" />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TABS 3-13: Faculty views */}
              {activeTab === 'students' && (
                <div className="space-y-6 text-left animate-in fade-in duration-300">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h1 className="text-2xl font-black text-white">Students Roster</h1>
                      <p className="text-sm text-brand-textMuted mt-1">Review active student learning progress, email details, and batch rosters.</p>
                    </div>
                  </div>

                  <div className="glass-card rounded-2xl border border-brand-purple/15 p-6">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-max text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-white/10 text-brand-pink font-bold uppercase tracking-wider pb-2">
                            <th className="py-3 whitespace-nowrap pr-4">Name</th>
                            <th className="py-3 whitespace-nowrap pr-4">Email</th>
                            <th className="py-3 whitespace-nowrap pr-4">Progress</th>
                            <th className="py-3 whitespace-nowrap pr-4">Status</th>
                            <th className="py-3 whitespace-nowrap text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 font-semibold text-gray-200">
                          {studentsList.map((stu) => (
                            <tr key={stu._id} className="hover:bg-brand-surface/20 transition-all">
                              <td className="py-4 font-bold text-white flex items-center gap-3 whitespace-nowrap pr-4">
                                <div className="w-8 h-8 rounded-full bg-brand-purple/30 flex items-center justify-center text-xs font-black shrink-0">
                                  {stu.name.charAt(0)}
                                </div>
                                {stu.name}
                              </td>
                              <td className="py-4 text-brand-textMuted whitespace-nowrap pr-4">{stu.email}</td>
                              <td className="py-4 w-1/4 whitespace-nowrap pr-4">
                                <div className="flex items-center gap-2">
                                  <div className="flex-grow min-w-[80px] h-1.5 bg-brand-dark rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-brand-pink to-brand-purple" style={{ width: `${stu.progress || 70}%` }}></div>
                                  </div>
                                  <span className="text-[10px] text-white">{stu.progress || 70}%</span>
                                </div>
                              </td>
                              <td className="py-4 whitespace-nowrap pr-4">
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${
                                  stu.active !== false 
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                    : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                }`}>
                                  {stu.active !== false ? 'Active' : 'Idle'}
                                </span>
                              </td>
                              <td className="py-4 text-right whitespace-nowrap">
                                <button
                                  onClick={() => {
                                    const chatIdx = chats.findIndex(c => c.studentName.toLowerCase().includes(stu.name.toLowerCase()));
                                    if (chatIdx !== -1) {
                                      setActiveChat(chatIdx);
                                    }
                                    setActiveTab('messages');
                                  }}
                                  className="bg-brand-pink/15 hover:bg-brand-pink/20 text-brand-pink border border-brand-pink/30 px-3 py-1 rounded-xl text-[10px] font-bold"
                                >
                                  Message Doubts
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'assignments' && (
                <div className="space-y-6 text-left animate-in fade-in duration-300">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h1 className="text-2xl font-black text-white">Homework & Submissions</h1>
                      <p className="text-sm text-brand-textMuted mt-1">Issue numerical lists, view uploads, and assign grades.</p>
                    </div>
                    <button
                      onClick={() => setShowAssignmentModal(true)}
                      className="btn-primary py-2.5 text-xs font-bold flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" /> Create Assignment
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* List of Issued Assignments */}
                    <div className="lg:col-span-1 space-y-4">
                      <h3 className="font-extrabold text-white text-sm">Issued Batches</h3>
                      {assignments.length === 0 ? (
                        <div className="p-6 text-center bg-brand-surface/20 rounded-2xl border border-brand-purple/10 border-dashed text-xs text-brand-textMuted">
                          No active assignments found.
                        </div>
                      ) : (
                        assignments.map((asg) => (
                          <div 
                            key={asg._id}
                            onClick={() => setSelectedAssignmentForGrading(asg)}
                            className={`p-4 rounded-2xl border transition-all cursor-pointer text-left space-y-3 ${
                              selectedAssignmentForGrading?._id === asg._id 
                                ? 'bg-brand-purple/20 border-brand-purple/50' 
                                : 'glass-card border-brand-purple/15 hover:border-brand-purple/30'
                            }`}
                          >
                            <h4 className="text-xs font-black text-white">{asg.title}</h4>
                            <p className="text-[10px] text-brand-textMuted line-clamp-2">{asg.description}</p>
                            <div className="flex justify-between items-center text-[9px] text-brand-textMuted">
                              <span>Max Score: {asg.totalMarks}</span>
                              <span className="text-brand-pink font-bold">Due: {asg.dueDate ? new Date(asg.dueDate).toLocaleDateString() : 'N/A'}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Submissions list & Grading */}
                    <div className="lg:col-span-2 space-y-4">
                      <h3 className="font-extrabold text-white text-sm">
                        {selectedAssignmentForGrading 
                          ? `Submissions for: ${selectedAssignmentForGrading.title}` 
                          : 'Student Submissions'
                        }
                      </h3>

                      <div className="glass-card rounded-2xl border border-brand-purple/15 p-5">
                        <div className="overflow-x-auto">
                          <table className="w-full min-w-max text-left border-collapse text-xs">
                            <thead>
                              <tr className="border-b border-white/10 text-brand-pink font-bold uppercase tracking-wider pb-2">
                                <th className="py-2.5 whitespace-nowrap pr-4">Student</th>
                                <th className="py-2.5 whitespace-nowrap pr-4">File</th>
                                <th className="py-2.5 whitespace-nowrap pr-4">Date</th>
                                <th className="py-2.5 whitespace-nowrap pr-4">Status</th>
                                <th className="py-2.5 whitespace-nowrap text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 font-semibold text-gray-200">
                               {dynamicSubmissions.length === 0 ? (
                                <tr>
                                  <td colSpan="5" className="text-center py-6 text-brand-textMuted">No submissions for this assignment.</td>
                                </tr>
                              ) : (
                                dynamicSubmissions.map((sub) => (
                                  <tr key={sub.id} className="hover:bg-brand-surface/20 transition-all">
                                    <td className="py-3 whitespace-nowrap pr-4">
                                      <div className="font-bold text-white leading-tight">{sub.name}</div>
                                      {sub.comment && <span className="text-[9px] text-brand-textMuted italic block mt-0.5 max-w-[150px] truncate">"{sub.comment}"</span>}
                                    </td>
                                    <td className="py-3 text-brand-purple hover:underline whitespace-nowrap pr-4">
                                      <a href={sub.fileUrl ? (sub.fileUrl.startsWith('http') ? sub.fileUrl : `http://localhost:8000${sub.fileUrl}`) : '#'} target="_blank" rel="noreferrer" className="flex items-center gap-1">
                                        <Download className="w-3.5 h-3.5" /> File
                                      </a>
                                    </td>
                                    <td className="py-3 text-brand-textMuted whitespace-nowrap pr-4">{sub.time}</td>
                                    <td className="py-3 whitespace-nowrap pr-4">
                                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                                        sub.status === 'Graded' 
                                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                          : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                      }`}>
                                        {sub.status}
                                      </span>
                                    </td>
                                    <td className="py-3 text-right whitespace-nowrap">
                                      {sub.status === 'Graded' ? (
                                        <div className="flex flex-col items-end">
                                          <span className="text-white text-xs font-black">Score: {sub.grade}</span>
                                          {sub.feedback && <span className="text-[9px] text-brand-textMuted">{sub.feedback}</span>}
                                        </div>
                                      ) : (
                                        <button 
                                          onClick={() => {
                                            setGradingState({
                                              studentId: sub.studentId,
                                              studentName: sub.name,
                                              assignmentId: selectedAssignmentForGrading?._id || 'mock_asg_1',
                                              grade: '',
                                              feedback: ''
                                            });
                                          }}
                                          className="bg-brand-purple/15 hover:bg-brand-purple/20 text-brand-purple border border-brand-purple/30 px-2.5 py-1 rounded-xl text-[9px] font-bold"
                                        >
                                          Grade
                                        </button>
                                      )}
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                                              {/* Grading Form Modal/Card */}
                        {gradingState.studentId && (
                          <div className="mt-6 border-t border-white/5 pt-5 space-y-4 text-left animate-in slide-in-from-top-2 duration-200">
                            <h4 className="text-xs font-black text-white uppercase tracking-wider">Evaluate Submission for {gradingState.studentName}</h4>
                            <form onSubmit={handleGradeSubmission} className="space-y-3">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <label className="text-[10px] text-brand-textMuted font-bold uppercase">Assigned Score</label>
                                  <input 
                                    type="number"
                                    required
                                    value={gradingState.grade}
                                    onChange={(e) => setGradingState({ ...gradingState, grade: e.target.value })}
                                    placeholder="e.g. 85"
                                    className="w-full bg-brand-dark border border-brand-purple/20 text-white rounded-xl py-2 px-3 focus:outline-none focus:border-brand-pink text-xs"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] text-brand-textMuted font-bold uppercase">Feedback Comment</label>
                                  <input 
                                    type="text"
                                    value={gradingState.feedback}
                                    onChange={(e) => setGradingState({ ...gradingState, feedback: e.target.value })}
                                    placeholder="Good proof work"
                                    className="w-full bg-brand-dark border border-brand-purple/20 text-white rounded-xl py-2 px-3 focus:outline-none focus:border-brand-pink text-xs"
                                  />
                                </div>
                              </div>
                              <div className="flex gap-2 justify-end">
                                <button 
                                  type="button" 
                                  onClick={() => setGradingState({ studentId: '', studentName: '', assignmentId: '', grade: '', feedback: '' })} 
                                  className="bg-brand-dark border border-brand-purple/20 px-3 py-1.5 rounded-xl text-xs"
                                >
                                  Cancel
                                </button>
                                <button type="submit" className="btn-primary px-4 py-1.5 text-xs font-bold">
                                  Submit Grade
                                </button>
                              </div>
                            </form>
                          </div>
                        )}

                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'attendance' && (
                <div className="space-y-6 text-left animate-in fade-in duration-300">
                  <div>
                    <h1 className="text-2xl font-black text-white">Student Attendance</h1>
                    <p className="text-sm text-brand-textMuted mt-1">Select class groups, pick schedule calendar dates, and mark student presence.</p>
                  </div>

                  <form onSubmit={handleSaveAttendance} className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                    {/* Filters column */}
                    <div className="lg:col-span-1 glass-card rounded-2xl border border-brand-purple/15 p-5 space-y-4">
                      <h4 className="text-xs font-black text-white uppercase tracking-wider border-b border-white/5 pb-2">Roster Selection</h4>
                      
                      <div className="space-y-1">
                        <label className="text-[10px] text-brand-textMuted font-bold uppercase">Select Course Batch</label>
                        <select 
                          required
                          value={attendanceCourse}
                          onChange={(e) => setAttendanceCourse(e.target.value)}
                          className="w-full bg-brand-dark border border-brand-purple/20 text-white rounded-xl py-2 px-3 focus:outline-none text-xs"
                        >
                          <option value="">-- Choose Course --</option>
                          {courses.map(c => <option key={c._id} value={c.title}>{c.title}</option>)}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-brand-textMuted font-bold uppercase">Class Date</label>
                        <input 
                          type="date"
                          required
                          value={attendanceDate}
                          onChange={(e) => setAttendanceDate(e.target.value)}
                          className="w-full bg-brand-dark border border-brand-purple/20 text-white rounded-xl py-2 px-3 focus:outline-none text-xs"
                        />
                      </div>

                      <button type="submit" className="w-full btn-primary py-2.5 text-xs font-bold">
                        Save Attendance Logs
                      </button>
                    </div>

                    {/* Attendance marked checkboxes */}
                    <div className="lg:col-span-3 glass-card rounded-2xl border border-brand-purple/15 p-5 space-y-4">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <h3 className="font-extrabold text-white text-sm">Attendance List</h3>
                        <span className="text-[10px] text-brand-pink font-bold">Total Enrolled: {attendanceRoster.length}</span>
                      </div>

                      <div className="divide-y divide-white/5">
                        {attendanceRoster.length > 0 ? (
                          attendanceRoster.map((stu) => (
                            <div key={stu.id} className="flex justify-between items-center py-3">
                              <div className="text-left">
                                <h5 className="text-xs font-bold text-white">{stu.name}</h5>
                                <p className="text-[10px] text-brand-textMuted">{stu.email}</p>
                              </div>

                              <label className="relative inline-flex items-center cursor-pointer select-none">
                                <input 
                                  type="checkbox"
                                  checked={stu.present}
                                  onChange={() => setAttendanceRoster(attendanceRoster.map(r => r.id === stu.id ? { ...r, present: !r.present } : r))}
                                  className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-brand-dark peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                                <span className="ml-3 text-xs font-semibold text-gray-200">
                                  {stu.present ? 'Present' : 'Absent'}
                                </span>
                              </label>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-6 text-brand-textMuted text-xs italic">
                            No students registered for attendance.
                          </div>
                        )}
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'live' && (
                <div className="space-y-6 text-left animate-in fade-in duration-300">
                  <div className="flex justify-between items-center">
                    <div>
                      <h1 className="text-2xl font-black text-white">Live Classes Rooms</h1>
                      <p className="text-sm text-brand-textMuted mt-1">Launch streams, share lecture whiteboard links, and schedule doubt clearing calls.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Live Stream Scheduler form */}
                    <div className="lg:col-span-4 glass-card rounded-2xl border border-brand-purple/15 p-5 space-y-4">
                      <h3 className="font-extrabold text-white text-sm border-b border-white/5 pb-2">Schedule Live Lecture</h3>
                      <form onSubmit={handleCreateLiveSession} className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[10px] text-brand-textMuted font-bold uppercase">Lecture Session Title</label>
                          <input 
                            type="text"
                            required
                            value={newLiveSession.title}
                            onChange={(e) => setNewLiveSession({ ...newLiveSession, title: e.target.value })}
                            placeholder="e.g. Gauss Law Vector Proofs"
                            className="w-full bg-brand-dark border border-brand-purple/20 text-white rounded-xl py-2 px-3 focus:outline-none text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-brand-textMuted font-bold uppercase">Associated Course</label>
                          <select 
                            required
                            value={newLiveSession.course}
                            onChange={(e) => setNewLiveSession({ ...newLiveSession, course: e.target.value })}
                            className="w-full bg-brand-dark border border-brand-purple/20 text-white rounded-xl py-2 px-3 focus:outline-none text-xs"
                          >
                            <option value="">-- Choose Course --</option>
                            {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] text-brand-textMuted font-bold uppercase">Date</label>
                            <input 
                              type="date"
                              required
                              value={newLiveSession.date}
                              onChange={(e) => setNewLiveSession({ ...newLiveSession, date: e.target.value })}
                              className="w-full bg-brand-dark border border-brand-purple/20 text-white rounded-xl py-2 px-3 focus:outline-none text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-brand-textMuted font-bold uppercase">Time</label>
                            <input 
                              type="text"
                              required
                              placeholder="e.g. 10:00 AM"
                              value={newLiveSession.time}
                              onChange={(e) => setNewLiveSession({ ...newLiveSession, time: e.target.value })}
                              className="w-full bg-brand-dark border border-brand-purple/20 text-white rounded-xl py-2 px-3 focus:outline-none text-xs"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-brand-textMuted font-bold uppercase">Duration (mins)</label>
                          <input 
                            type="number"
                            required
                            value={newLiveSession.duration}
                            onChange={(e) => setNewLiveSession({ ...newLiveSession, duration: e.target.value })}
                            className="w-full bg-brand-dark border border-brand-purple/20 text-white rounded-xl py-2 px-3 focus:outline-none text-xs"
                          />
                        </div>
                        <button type="submit" className="w-full btn-primary py-2.5 text-xs font-bold flex items-center justify-center gap-1.5">
                          <Video className="w-4 h-4" /> Schedule Stream Room
                        </button>
                      </form>
                    </div>

                    {/* Scheduled streams list */}
                    <div className="lg:col-span-8 space-y-6">
                      {/* Active Scheduled Rooms */}
                      <div className="glass-card rounded-2xl border border-brand-purple/15 p-5 space-y-4">
                        <h3 className="font-extrabold text-white text-sm border-b border-white/5 pb-2">Active Scheduled Rooms</h3>
                        <div className="space-y-3">
                          {liveSessions.filter(s => s.status !== 'Completed').length > 0 ? (
                            liveSessions.filter(s => s.status !== 'Completed').map((session) => (
                              <div key={session._id || session.id} className="flex justify-between items-center p-4 bg-brand-surface/30 border border-brand-purple/10 rounded-2xl hover:border-brand-purple/20 transition-all">
                                <div className="flex gap-4 items-center">
                                  <div className="w-10 h-10 rounded-xl bg-brand-pink/15 flex items-center justify-center text-brand-pink shrink-0">
                                    <Video className="w-5 h-5" />
                                  </div>
                                  <div className="text-left">
                                    <h4 className="text-xs font-black text-white">{session.title}</h4>
                                    <p className="text-[9px] text-brand-textMuted mt-0.5">
                                      {typeof session.course === 'object' ? session.course?.title : session.course} • Duration: {session.duration} mins
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right flex items-center gap-4">
                                  <div>
                                    <span className="text-[10px] text-brand-pink font-bold block">{session.date}</span>
                                    <span className="text-[9px] text-brand-textMuted block">{session.time}</span>
                                  </div>
                                  <div className="flex gap-2">
                                    <button 
                                      onClick={() => navigate(`/meeting/${session.meetingId}`)} 
                                      className="bg-brand-pink text-white text-[10px] font-bold px-3 py-1.5 rounded-xl hover:opacity-90 transition-all"
                                    >
                                      Join
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteLiveSession(session._id)} 
                                      className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-[10px] font-bold px-3 py-1.5 rounded-xl transition-all"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-8 text-brand-textMuted text-xs italic">
                              No active scheduled classes.
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Past Classes & Recordings */}
                      <div className="glass-card rounded-2xl border border-brand-purple/15 p-5 space-y-4">
                        <h3 className="font-extrabold text-white text-sm border-b border-white/5 pb-2">Past Classes & Recordings</h3>
                        <div className="space-y-3">
                          {liveSessions.filter(s => s.status === 'Completed').length > 0 ? (
                            liveSessions.filter(s => s.status === 'Completed').map((session) => (
                              <div key={session._id || session.id} className="flex justify-between items-center p-4 bg-[#0A004C]/30 border border-brand-purple/10 rounded-2xl hover:border-brand-purple/20 transition-all">
                                <div className="flex gap-4 items-center">
                                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                                    <Video className="w-5 h-5" />
                                  </div>
                                  <div className="text-left">
                                    <h4 className="text-xs font-black text-white">{session.title}</h4>
                                    <p className="text-[9px] text-brand-textMuted mt-0.5">
                                      {typeof session.course === 'object' ? session.course?.title : session.course} • Duration: {session.duration} mins
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right flex items-center gap-4">
                                  <div>
                                    <span className="text-[10px] text-brand-pink font-bold block">{session.date}</span>
                                    <span className="text-[9px] text-brand-textMuted block">{session.time}</span>
                                  </div>
                                  <div className="flex gap-2">
                                    {session.recordingUrl ? (
                                      <button 
                                        onClick={() => setRecordingUrl(session.recordingUrl)} 
                                        className="bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-xl transition-all shadow-md"
                                      >
                                        Watch Recording
                                      </button>
                                    ) : (
                                      <span className="text-[10px] text-brand-textMuted italic font-semibold mr-2">Processing...</span>
                                    )}
                                    <button 
                                      onClick={() => handleDeleteLiveSession(session._id)} 
                                      className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-[10px] font-bold px-3 py-1.5 rounded-xl transition-all"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-8 text-brand-textMuted text-xs italic">
                              No recorded live classes available.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'materials' && (
                <div className="space-y-6 text-left animate-in fade-in duration-300">
                  <div className="flex justify-between items-center">
                    <div>
                      <h1 className="text-2xl font-black text-white">Study Materials</h1>
                      <p className="text-sm text-brand-textMuted mt-1">Upload reference notes, solution documents, and course syllabus guidelines.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Upload File Form */}
                    <div className="lg:col-span-4 glass-card rounded-2xl border border-brand-purple/15 p-5 space-y-4">
                      <h3 className="font-extrabold text-white text-sm border-b border-white/5 pb-2">Publish Study Material</h3>
                      <form onSubmit={handleCreateMaterial} className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[10px] text-brand-textMuted font-bold uppercase">Resource Title</label>
                          <input 
                            type="text"
                            required
                            value={newMaterial.title}
                            onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })}
                            placeholder="e.g. Current Electricity Formula Sheet"
                            className="w-full bg-brand-dark border border-brand-purple/20 text-white rounded-xl py-2 px-3 focus:outline-none text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-brand-textMuted font-bold uppercase">Course Batch</label>
                          <select 
                            required
                            value={newMaterial.course}
                            onChange={(e) => setNewMaterial({ ...newMaterial, course: e.target.value })}
                            className="w-full bg-brand-dark border border-brand-purple/20 text-white rounded-xl py-2 px-3 focus:outline-none text-xs"
                          >
                            <option value="">-- Choose Course --</option>
                            {courses.map(c => <option key={c._id} value={c.title}>{c.title}</option>)}
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] text-brand-textMuted font-bold uppercase">File Type</label>
                            <select 
                              value={newMaterial.type}
                              onChange={(e) => setNewMaterial({ ...newMaterial, type: e.target.value })}
                              className="w-full bg-brand-dark border border-brand-purple/20 text-white rounded-xl py-2 px-3 focus:outline-none text-xs"
                            >
                              <option value="PDF">PDF Document</option>
                              <option value="Video">Video File</option>
                              <option value="Document">Word Document</option>
                              <option value="Image">Graphic Image</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-brand-textMuted font-bold uppercase">File Size Estimate</label>
                            <input 
                              type="text"
                              value={newMaterial.size}
                              onChange={(e) => setNewMaterial({ ...newMaterial, size: e.target.value })}
                              className="w-full bg-brand-dark border border-brand-purple/20 text-white rounded-xl py-2 px-3 focus:outline-none text-xs"
                            />
                          </div>
                        </div>

                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          onDragOver={(e) => { e.preventDefault(); setIsDraggingFile(true); }}
                          onDragLeave={() => setIsDraggingFile(false)}
                          onDrop={(e) => { e.preventDefault(); setIsDraggingFile(false); if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]); }}
                          className={`border border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                            isDraggingFile 
                              ? 'border-brand-pink bg-brand-pink/5 scale-102' 
                              : selectedFile 
                                ? 'border-brand-purple/40 bg-brand-purple/5' 
                                : 'border-brand-purple/15 hover:border-brand-pink'
                          }`}
                        >
                          <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} 
                            className="hidden" 
                          />
                          {selectedFile ? (
                            <div className="space-y-1 text-left relative z-10 flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="p-2 bg-brand-purple/15 rounded-lg text-brand-purple shrink-0">
                                  <FileText className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-[11px] font-extrabold text-white truncate leading-tight">{selectedFile.name}</p>
                                  <p className="text-[9px] text-brand-textMuted mt-0.5">{newMaterial.size} • Ready to Publish</p>
                                </div>
                              </div>
                              <button 
                                type="button" 
                                onClick={(e) => { e.stopPropagation(); setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                                className="text-brand-textMuted hover:text-brand-pink p-1 hover:bg-white/5 rounded-lg transition-all shrink-0"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <Upload className={`w-6 h-6 mx-auto mb-2 transition-all ${isDraggingFile ? 'text-brand-pink animate-bounce' : 'text-brand-textMuted'}`} />
                              <span className="text-[10px] text-brand-textMuted font-bold uppercase block">
                                {isDraggingFile ? 'Drop file here!' : 'Choose files or drop here'}
                              </span>
                            </>
                          )}
                        </div>

                        <button type="submit" className="w-full btn-primary py-2.5 text-xs font-bold flex items-center justify-center gap-1.5">
                          Publish reference file
                        </button>
                      </form>
                    </div>

                    {/* Materials listing */}
                    <div className="lg:col-span-8 glass-card rounded-2xl border border-brand-purple/15 p-5 space-y-4">
                      <h3 className="font-extrabold text-white text-sm border-b border-white/5 pb-2">Available Vault Files</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {materials.length > 0 ? (
                          materials.map((file) => (
                            <div key={file.id} className="p-4 bg-brand-surface/30 border border-brand-purple/10 rounded-2xl hover:border-brand-purple/20 transition-all flex flex-col justify-between h-[120px]">
                              <div className="text-left">
                                <span className="bg-brand-purple/10 border border-brand-purple/35 text-brand-purple px-2 py-0.5 rounded text-[8px] font-black uppercase">
                                  {file.type}
                                </span>
                                <h4 className="text-xs font-black text-white mt-2 truncate">{file.title}</h4>
                                <p className="text-[9px] text-brand-textMuted mt-0.5 truncate">{file.course}</p>
                              </div>
                              <div className="flex justify-between items-center border-t border-white/5 pt-2 mt-2 text-[10px]">
                                <span className="text-brand-textMuted">{file.size}</span>
                                <button onClick={() => alert("Downloading file...")} className="text-brand-pink font-bold flex items-center gap-0.5 hover:underline">
                                  <Download className="w-3.5 h-3.5" /> Download
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="col-span-full text-center py-8 text-brand-textMuted text-xs italic">
                            No reference materials uploaded yet.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'quizzes' && (
                <div className="space-y-6 text-left animate-in fade-in duration-300">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h1 className="text-2xl font-black text-white">Quizzes & Exam Portals</h1>
                      <p className="text-sm text-brand-textMuted mt-1">Publish MCQs sheets, view student marks rank sheets, and configure exam settings.</p>
                    </div>
                    <button
                      onClick={() => setShowTestModal(true)}
                      className="btn-primary py-2.5 text-xs font-bold flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" /> Create Test Quiz
                    </button>
                  </div>

                  <div className="glass-card rounded-2xl border border-brand-purple/15 p-6">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-max text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-white/10 text-brand-pink font-bold uppercase tracking-wider pb-2">
                            <th className="py-3 whitespace-nowrap pr-4">Quiz Exam Title</th>
                            <th className="py-3 whitespace-nowrap pr-4">Duration</th>
                            <th className="py-3 whitespace-nowrap pr-4">Questions Count</th>
                            <th className="py-3 whitespace-nowrap pr-4">Total Marks</th>
                            <th className="py-3 whitespace-nowrap text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 font-semibold text-gray-200">
                          {tests.map((test) => (
                            <tr key={test._id} className="hover:bg-brand-surface/20 transition-all">
                              <td className="py-4 font-bold text-white flex items-center gap-3 whitespace-nowrap pr-4">
                                <div className="w-8 h-8 rounded-full bg-brand-pink/15 flex items-center justify-center text-xs font-black text-brand-pink shrink-0">
                                  Q
                                </div>
                                <div className="text-left">
                                  <div>{test.title}</div>
                                  <span className="text-[9px] text-brand-textMuted lowercase tracking-widest">{test.testType} test</span>
                                </div>
                              </td>
                              <td className="py-4 text-brand-textMuted whitespace-nowrap pr-4">{test.duration} minutes</td>
                              <td className="py-4 text-brand-textMuted whitespace-nowrap pr-4">{test.questions?.length || 0} Questions</td>
                              <td className="py-4 font-bold text-white whitespace-nowrap pr-4">{test.totalMarks || 120} Marks</td>
                              <td className="py-4 text-right whitespace-nowrap">
                                <button 
                                  onClick={() => alert(`Showing leaderboard statistics for ${test.title}...`)}
                                  className="bg-brand-pink/10 hover:bg-brand-pink/20 text-brand-pink border border-brand-pink/30 px-3 py-1 rounded-xl text-[10px] font-bold"
                                >
                                  Rankings
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'announcements' && (
                <div className="space-y-6 text-left animate-in fade-in duration-300">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h1 className="text-2xl font-black text-white">Batches Announcements</h1>
                      <p className="text-sm text-brand-textMuted mt-1">Broadcast class notifications, session timing changes, and schedule shifts.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Announcement Form */}
                    <div className="lg:col-span-4 glass-card rounded-2xl border border-brand-purple/15 p-5 space-y-4">
                      <h3 className="font-extrabold text-white text-sm border-b border-white/5 pb-2">Publish Announcement</h3>
                      <form onSubmit={handleCreateAnnouncement} className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[10px] text-brand-textMuted font-bold uppercase">Heading Title</label>
                          <input 
                            type="text"
                            required
                            value={newAnnouncement.title}
                            onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                            placeholder="e.g. Weekly Test Reschedule"
                            className="w-full bg-brand-dark border border-brand-purple/20 text-white rounded-xl py-2 px-3 focus:outline-none text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-brand-textMuted font-bold uppercase">Target Course</label>
                          <select 
                            value={newAnnouncement.course}
                            onChange={(e) => setNewAnnouncement({ ...newAnnouncement, course: e.target.value })}
                            className="w-full bg-brand-dark border border-brand-purple/20 text-white rounded-xl py-2 px-3 focus:outline-none text-xs"
                          >
                            <option value="">All Batches</option>
                            {courses.map(c => <option key={c._id} value={c.title}>{c.title}</option>)}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-brand-textMuted font-bold uppercase">Broadcasting Content</label>
                          <textarea 
                            required
                            rows={4}
                            value={newAnnouncement.content}
                            onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                            placeholder="Write message details..."
                            className="w-full bg-brand-dark border border-brand-purple/20 text-white rounded-xl py-2 px-3 focus:outline-none text-xs resize-none"
                          ></textarea>
                        </div>
                        <button type="submit" className="w-full btn-primary py-2.5 text-xs font-bold flex items-center justify-center gap-1.5">
                          <Megaphone className="w-4 h-4" /> Broadcast message
                        </button>
                      </form>
                    </div>

                    {/* Announcement feed list */}
                    <div className="lg:col-span-8 glass-card rounded-2xl border border-brand-purple/15 p-5 space-y-4">
                      <h3 className="font-extrabold text-white text-sm border-b border-white/5 pb-2">Issued Timeline</h3>
                      <div className="space-y-4">
                        {announcements.length > 0 ? (
                          announcements.map((ann) => (
                            <div key={ann.id} className="p-4 bg-brand-surface/30 border border-brand-purple/10 rounded-2xl hover:border-brand-purple/20 transition-all text-left space-y-2">
                              <div className="flex justify-between items-start">
                                <span className="bg-brand-pink/15 border border-brand-pink/20 text-brand-pink px-2 py-0.5 rounded text-[8px] font-black uppercase">
                                  {ann.course}
                                </span>
                                <span className="text-[9px] text-brand-textMuted">{ann.date}</span>
                              </div>
                              <h4 className="text-xs font-black text-white">{ann.title}</h4>
                              <p className="text-[10px] text-gray-200 leading-relaxed">{ann.content}</p>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-brand-textMuted text-xs italic">
                            No announcements posted yet.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'reports' && (
                <div className="space-y-6 text-left animate-in fade-in duration-300">
                  <div>
                    <h1 className="text-2xl font-black text-white">Faculty Reports & Analytics</h1>
                    <p className="text-sm text-brand-textMuted mt-1">Review visual class statistics grids, assignment score charts, and course metrics.</p>
                  </div>

                  {/* Reports Stats Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="glass-card p-4 rounded-xl border border-brand-purple/15 text-left">
                      <span className="text-[9px] text-brand-textMuted font-bold uppercase tracking-wider block">Avg Class Score</span>
                      <span className="text-lg font-black text-white block mt-1">{avgClassScore}</span>
                    </div>
                    <div className="glass-card p-4 rounded-xl border border-brand-purple/15 text-left">
                      <span className="text-[9px] text-brand-textMuted font-bold uppercase tracking-wider block">Average Attendance</span>
                      <span className="text-lg font-black text-white block mt-1">{avgAttendance}</span>
                    </div>
                    <div className="glass-card p-4 rounded-xl border border-brand-purple/15 text-left">
                      <span className="text-[9px] text-brand-textMuted font-bold uppercase tracking-wider block">Course Completion</span>
                      <span className="text-lg font-black text-white block mt-1">{avgCourseCompletion}</span>
                    </div>
                    <div className="glass-card p-4 rounded-xl border border-brand-purple/15 text-left">
                      <span className="text-[9px] text-brand-textMuted font-bold uppercase tracking-wider block">Active Students Ratio</span>
                      <span className="text-lg font-black text-white block mt-1">{activeStudentsRatio}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* SVG Analytics Chart */}
                    <div className="lg:col-span-8 glass-card rounded-2xl border border-brand-purple/15 p-5">
                      <h3 className="font-extrabold text-white text-sm border-b border-white/5 pb-2 mb-4">Grade Distribution Curve</h3>
                      
                      <div className="h-56">
                        <svg viewBox="0 0 100 50" className="w-full h-full">
                          <line x1="10" y1="5" x2="10" y2="45" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
                          <line x1="10" y1="45" x2="95" y2="45" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
                          {/* Grid Lines */}
                          <line x1="10" y1="15" x2="95" y2="15" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                          <line x1="10" y1="25" x2="95" y2="25" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                          <line x1="10" y1="35" x2="95" y2="35" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                          {/* Bell Curve */}
                          <path d="M 10 45 Q 35 45, 50 15 T 90 45" fill="none" stroke="#FF2E93" strokeWidth="1.5" />
                          <path d="M 10 45 Q 35 45, 50 15 T 90 45 Z" fill="rgba(255, 46, 147, 0.1)" />
                          {/* Labels */}
                          <text x="12" y="10" fill="#8b8ea8" fontSize="3">Students Count</text>
                          <text x="85" y="48" fill="#8b8ea8" fontSize="3">Exam Score %</text>
                          <text x="47" y="12" fill="#FF2E93" fontSize="3" fontWeight="bold">Average ({avgClassScore === 'N/A' ? '0%' : avgClassScore})</text>
                        </svg>
                      </div>
                    </div>

                    {/* Exportable PDF / Sheets reports */}
                    <div className="lg:col-span-4 glass-card rounded-2xl border border-brand-purple/15 p-5 space-y-4">
                      <h3 className="font-extrabold text-white text-sm border-b border-white/5 pb-2">Export Data Sheets</h3>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-brand-surface/20 border border-brand-purple/10 rounded-xl hover:border-brand-purple/20 transition-all">
                          <div className="flex items-center gap-2">
                            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                            <div className="text-left">
                              <h5 className="text-[10px] font-bold text-white">Students Attendance Sheets</h5>
                              <span className="text-[8px] text-brand-textMuted">PDF & CSV options</span>
                            </div>
                          </div>
                          <button onClick={() => alert("Downloading spreadsheet...")} className="p-1 text-brand-pink hover:bg-white/5 rounded"><Download className="w-4 h-4" /></button>
                        </div>

                        <div className="flex justify-between items-center p-3 bg-brand-surface/20 border border-brand-purple/10 rounded-xl hover:border-brand-purple/20 transition-all">
                          <div className="flex items-center gap-2">
                            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                            <div className="text-left">
                              <h5 className="text-[10px] font-bold text-white">Quizzes Rankings & Marks</h5>
                              <span className="text-[8px] text-brand-textMuted">CSV Spreadsheet format</span>
                            </div>
                          </div>
                          <button onClick={() => alert("Downloading spreadsheet...")} className="p-1 text-brand-pink hover:bg-white/5 rounded"><Download className="w-4 h-4" /></button>
                        </div>

                        <div className="flex justify-between items-center p-3 bg-brand-surface/20 border border-brand-purple/10 rounded-xl hover:border-brand-purple/20 transition-all">
                          <div className="flex items-center gap-2">
                            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                            <div className="text-left">
                              <h5 className="text-[10px] font-bold text-white">Earnings & Withdrawals Report</h5>
                              <span className="text-[8px] text-brand-textMuted">Financial PDF statement</span>
                            </div>
                          </div>
                          <button onClick={() => alert("Downloading spreadsheet...")} className="p-1 text-brand-pink hover:bg-white/5 rounded"><Download className="w-4 h-4" /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'messages' && (
                <div className="space-y-6 text-left animate-in fade-in duration-300 h-[600px] flex flex-col justify-between">
                  <div>
                    <h1 className="text-2xl font-black text-white">Student Discussions</h1>
                    <p className="text-sm text-brand-textMuted mt-1">Resolve doubts, share reference slides, and help students with equations.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-brand-surface/20 border border-brand-purple/15 rounded-2xl overflow-hidden flex-grow">
                    {/* Conversations list */}
                    <div className="md:col-span-4 border-r border-brand-purple/10 flex flex-col bg-brand-dark/25">
                      <div className="p-4 border-b border-brand-purple/10">
                        <h3 className="font-extrabold text-white text-sm">Discussions</h3>
                      </div>
                      <div className="divide-y divide-white/5 overflow-y-auto flex-1">
                        {chats.length > 0 ? (
                          chats.map((chat, idx) => (
                            <button
                              key={chat.id}
                              onClick={() => setActiveChat(idx)}
                              className={`w-full p-4 text-left flex items-center gap-3.5 transition-all ${
                                activeChat === idx
                                  ? 'bg-brand-purple/20'
                                  : 'hover:bg-white/5'
                              }`}
                            >
                              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-pink to-brand-purple flex items-center justify-center text-xs font-black text-white shrink-0">
                                {chat.avatar}
                              </div>
                              <div className="min-w-0 flex-1">
                                <h5 className="text-xs font-extrabold text-white truncate leading-none">{chat.studentName}</h5>
                                <p className="text-[9px] text-brand-textMuted truncate mt-1">
                                  {chat.messages[chat.messages.length - 1].text}
                                </p>
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="p-4 text-center text-brand-textMuted text-xs italic">
                            No active discussions.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Chat Thread */}
                    <div className="md:col-span-8 flex flex-col justify-between h-[400px] md:h-full bg-brand-dark/10">
                      {chats.length > 0 ? (
                        <>
                          {/* Thread header */}
                          <div className="p-4 border-b border-brand-purple/10 bg-[#0F0052]/20">
                            <h4 className="text-xs font-extrabold text-white leading-none">{chats[activeChat]?.studentName}</h4>
                            <span className="text-[8px] text-emerald-400 font-bold flex items-center gap-1 mt-1 leading-none">
                              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span> Student Online
                            </span>
                          </div>

                          {/* Chat Messages */}
                          <div className="p-4 flex-1 overflow-y-auto space-y-4">
                            {chats[activeChat]?.messages?.map((msg, idx) => {
                              const isTeacher = msg.sender === 'teacher';
                              return (
                                <div key={idx} className={`flex ${isTeacher ? 'justify-end' : 'justify-start'}`}>
                                  <div className={`max-w-[75%] p-3 rounded-xl text-xs space-y-1 ${
                                    isTeacher
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

                          {/* Message form */}
                          <form onSubmit={handleSendMessage} className="p-4 border-t border-brand-purple/10 bg-[#0F0052]/20 flex gap-3">
                            <input
                              type="text"
                              placeholder="Type answer details here..."
                              value={chatInput}
                              onChange={(e) => setChatInput(e.target.value)}
                              className="bg-brand-dark/40 border border-brand-purple/20 rounded-xl px-4 py-2 text-xs text-white placeholder-brand-textMuted focus:outline-none focus:border-brand-pink flex-grow"
                            />
                            <button type="submit" className="btn-primary p-2 shrink-0 rounded-xl">
                              <Send className="w-4 h-4" />
                            </button>
                          </form>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-8 text-center text-brand-textMuted text-sm italic h-full">
                          Select a conversation to reply to student queries.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'earnings' && (
                <div className="space-y-6 text-left animate-in fade-in duration-300">
                  <div>
                    <h1 className="text-2xl font-black text-white">Payout Earnings Ledger</h1>
                    <p className="text-sm text-brand-textMuted mt-1">Check monthly commission percentages, student payouts logs, and request withdrawals.</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Withdrawal action card */}
                    <div className="glass-card rounded-2xl border border-brand-purple/15 p-5 flex flex-col justify-between h-[200px]">
                      <div>
                        <span className="text-[9px] text-brand-textMuted font-bold uppercase tracking-wider block">Available for Payout</span>
                        <span className="text-2xl font-black text-white mt-1 block">₹{Math.round((stats?.totalEarnings || 0) * 0.05).toLocaleString()}</span>
                      </div>
                      <div>
                        <button onClick={() => alert("Withdrawal request submitted! Payout processing typically takes 2-3 business days.")} className="w-full btn-primary py-2.5 text-xs font-bold">
                          Withdraw to Bank Account
                        </button>
                      </div>
                    </div>

                    {/* Payout statistics and commissions */}
                    <div className="lg:col-span-2 glass-card rounded-2xl border border-brand-purple/15 p-5 space-y-4">
                      <h3 className="font-extrabold text-white text-sm border-b border-white/5 pb-2">Commissions Breakdown</h3>
                      <div className="space-y-3.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-brand-textMuted">Total Batch Enrollments Revenue:</span>
                          <span className="text-white font-black">₹{totalRevenue.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-emerald-400 font-bold">5.0% flat fee</span>
                        </div>
                        <div className="flex justify-between items-center text-xs border-t border-white/5 pt-2">
                          <span className="text-brand-textMuted">Accumulated Earnings:</span>
                          <span className="text-white font-black">₹{(stats?.totalEarnings || 0).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-6 text-left animate-in fade-in duration-300">
                  <div>
                    <h1 className="text-2xl font-black text-white">Profile Configuration</h1>
                    <p className="text-sm text-brand-textMuted mt-1">Manage public profile details, email notifications, and dashboard preferences.</p>
                  </div>

                  <form onSubmit={(e) => { e.preventDefault(); alert("Profile updated!"); }} className="glass-card rounded-2xl border border-brand-purple/15 p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <label className="text-[10px] text-brand-textMuted font-bold uppercase">Display Name</label>
                        <input 
                          type="text"
                          required
                          value={teacherName}
                          disabled
                          className="w-full bg-brand-dark/40 border border-brand-purple/20 text-brand-textMuted rounded-xl py-2.5 px-4 text-xs cursor-not-allowed"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-brand-textMuted font-bold uppercase">Registered Email</label>
                        <input 
                          type="email"
                          required
                          value={teacherEmail}
                          disabled
                          className="w-full bg-brand-dark/40 border border-brand-purple/20 text-brand-textMuted rounded-xl py-2.5 px-4 text-xs cursor-not-allowed"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-brand-textMuted font-bold uppercase">Display Subject</label>
                        <input 
                          type="text"
                          required
                          defaultValue="Physics Teacher"
                          className="w-full bg-brand-dark border border-brand-purple/20 text-white rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:border-brand-pink"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-brand-textMuted font-bold uppercase">Faculty Phone Contact</label>
                        <input 
                          type="text"
                          defaultValue="+91 99988 87766"
                          className="w-full bg-brand-dark border border-brand-purple/20 text-white rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:border-brand-pink"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-white/5">
                      <button type="submit" className="btn-primary py-2.5 px-6 text-xs font-bold">
                        Save Preferences
                      </button>
                    </div>
                  </form>
                </div>
              )}

            </div>
            {/* 3. Global Website Footer */}
            <Footer />
          </div>
        </main>
      </div>

      {/* CREATE COURSE MODAL */}
      {showCourseModal && (
        <div className="fixed inset-0 bg-brand-dark/95 z-[999] flex items-center justify-center p-4">
          <div className="bg-[#050029] border border-brand-purple/20 rounded-3xl p-6 sm:p-8 w-full max-w-xl relative shadow-2xl overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setShowCourseModal(false)}
              className="absolute top-4 right-4 text-brand-textMuted hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-xl font-black text-white mb-6">Create New Course Batch</h3>

            <form onSubmit={handleCreateCourse} className="space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-xs text-brand-textMuted font-bold uppercase">Course Title</label>
                <input
                  type="text"
                  required
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                  placeholder="e.g. Master Calculus & Integrals"
                  className="w-full bg-brand-surface border border-brand-purple/20 text-white rounded-xl py-2.5 px-4 focus:outline-none focus:border-brand-pink text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-brand-textMuted font-bold uppercase">Short Hook Description</label>
                <input
                  type="text"
                  required
                  value={newCourse.shortDescription}
                  onChange={(e) => setNewCourse({ ...newCourse, shortDescription: e.target.value })}
                  placeholder="Summarize course value in one sentence"
                  className="w-full bg-brand-surface border border-brand-purple/20 text-white rounded-xl py-2.5 px-4 focus:outline-none focus:border-brand-pink text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-brand-textMuted font-bold uppercase">Full Description</label>
                <textarea
                  required
                  rows={3}
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                  placeholder="Detailed course description..."
                  className="w-full bg-brand-surface border border-brand-purple/20 text-white rounded-xl py-2.5 px-4 focus:outline-none focus:border-brand-pink text-sm resize-none"
                ></textarea>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-brand-textMuted font-bold uppercase block">Course Cover Thumbnail</label>
                <div className="flex items-center gap-4">
                  {newCourse.thumbnail?.url ? (
                    <img 
                      src={newCourse.thumbnail.url} 
                      alt="Thumbnail Preview" 
                      className="w-20 h-12 object-cover rounded-lg border border-brand-purple/20 bg-brand-surface" 
                    />
                  ) : (
                    <div className="w-20 h-12 rounded-lg bg-brand-surface border border-brand-purple/20 flex items-center justify-center text-xs text-brand-textMuted">
                      No Image
                    </div>
                  )}
                  <div className="relative">
                    <button
                      type="button"
                      disabled={thumbnailUploading}
                      className="btn-secondary py-2 px-4 text-xs font-bold relative"
                    >
                      {thumbnailUploading ? 'Uploading...' : 'Choose Image'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleThumbnailUpload(e, false)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={thumbnailUploading}
                      />
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-brand-textMuted font-bold uppercase">Base Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={newCourse.price}
                    onChange={(e) => setNewCourse({ ...newCourse, price: e.target.value })}
                    placeholder="e.g. 3999"
                    className="w-full bg-brand-surface border border-brand-purple/20 text-white rounded-xl py-2.5 px-4 focus:outline-none focus:border-brand-pink text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-brand-textMuted font-bold uppercase">Offer Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={newCourse.discountPrice}
                    onChange={(e) => setNewCourse({ ...newCourse, discountPrice: e.target.value })}
                    placeholder="e.g. 1999"
                    className="w-full bg-brand-surface border border-brand-purple/20 text-white rounded-xl py-2.5 px-4 focus:outline-none focus:border-brand-pink text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-brand-textMuted font-bold uppercase">Category</label>
                  <select
                    value={newCourse.category}
                    onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })}
                    className="w-full bg-brand-surface border border-brand-purple/20 text-white rounded-xl py-2.5 px-3 focus:outline-none focus:border-brand-pink text-sm"
                  >
                    <option value="jee">JEE</option>
                    <option value="neet">NEET</option>
                    <option value="boards-11-12">Boards 11-12</option>
                    <option value="boards-5-10">Foundation 5-10</option>
                    <option value="college">College</option>
                    <option value="commerce">Commerce</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-brand-textMuted font-bold uppercase">Subject</label>
                  <select
                    value={newCourse.subject}
                    onChange={(e) => setNewCourse({ ...newCourse, subject: e.target.value })}
                    className="w-full bg-brand-surface border border-brand-purple/20 text-white rounded-xl py-2.5 px-3 focus:outline-none focus:border-brand-pink text-sm"
                  >
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Biology">Biology</option>
                    <option value="Commerce">Commerce</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-brand-textMuted font-bold uppercase">Level</label>
                  <select
                    value={newCourse.level}
                    onChange={(e) => setNewCourse({ ...newCourse, level: e.target.value })}
                    className="w-full bg-brand-surface border border-brand-purple/20 text-white rounded-xl py-2.5 px-3 focus:outline-none focus:border-brand-pink text-sm"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 py-2">
                <input
                  type="checkbox"
                  id="createIsPublished"
                  checked={newCourse.isPublished}
                  onChange={(e) => setNewCourse({ ...newCourse, isPublished: e.target.checked })}
                  className="w-4 h-4 rounded border-brand-purple/20 bg-brand-surface text-brand-pink focus:ring-brand-pink"
                />
                <label htmlFor="createIsPublished" className="text-xs text-brand-textMuted font-semibold select-none cursor-pointer">
                  Publish immediately (make visible in student catalog)
                </label>
              </div>

              <button
                type="submit"
                className="w-full btn-primary py-3 flex items-center justify-center gap-1.5 font-bold"
              >
                Publish Course
              </button>
            </form>
          </div>
        </div>
      )}

      {/* EDIT COURSE MODAL */}
      {showEditCourseModal && editingCourse && (
        <div className="fixed inset-0 bg-brand-dark/95 z-[999] flex items-center justify-center p-4">
          <div className="bg-[#050029] border border-brand-purple/20 rounded-3xl p-6 sm:p-8 w-full max-w-xl relative shadow-2xl overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => {
                setShowEditCourseModal(false);
                setEditingCourse(null);
              }}
              className="absolute top-4 right-4 text-brand-textMuted hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-xl font-black text-white mb-6">Modify Course Outline</h3>

            <form onSubmit={handleUpdateCourse} className="space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-xs text-brand-textMuted font-bold uppercase">Course Title</label>
                <input
                  type="text"
                  required
                  value={editingCourse.title}
                  onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
                  placeholder="e.g. Master Calculus & Integrals"
                  className="w-full bg-brand-surface border border-brand-purple/20 text-white rounded-xl py-2.5 px-4 focus:outline-none focus:border-brand-pink text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-brand-textMuted font-bold uppercase">Short Hook Description</label>
                <input
                  type="text"
                  required
                  value={editingCourse.shortDescription}
                  onChange={(e) => setEditingCourse({ ...editingCourse, shortDescription: e.target.value })}
                  placeholder="Summarize course value in one sentence"
                  className="w-full bg-brand-surface border border-brand-purple/20 text-white rounded-xl py-2.5 px-4 focus:outline-none focus:border-brand-pink text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-brand-textMuted font-bold uppercase">Full Description</label>
                <textarea
                  required
                  rows={3}
                  value={editingCourse.description}
                  onChange={(e) => setEditingCourse({ ...editingCourse, description: e.target.value })}
                  placeholder="Detailed course description..."
                  className="w-full bg-brand-surface border border-brand-purple/20 text-white rounded-xl py-2.5 px-4 focus:outline-none focus:border-brand-pink text-sm resize-none"
                ></textarea>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-brand-textMuted font-bold uppercase block">Course Cover Thumbnail</label>
                <div className="flex items-center gap-4">
                  {editingCourse.thumbnail?.url ? (
                    <img 
                      src={editingCourse.thumbnail.url} 
                      alt="Thumbnail Preview" 
                      className="w-20 h-12 object-cover rounded-lg border border-brand-purple/20 bg-brand-surface" 
                    />
                  ) : (
                    <div className="w-20 h-12 rounded-lg bg-brand-surface border border-brand-purple/20 flex items-center justify-center text-xs text-brand-textMuted">
                      No Image
                    </div>
                  )}
                  <div className="relative">
                    <button
                      type="button"
                      disabled={thumbnailUploading}
                      className="btn-secondary py-2 px-4 text-xs font-bold relative"
                    >
                      {thumbnailUploading ? 'Uploading...' : 'Choose Image'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleThumbnailUpload(e, true)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={thumbnailUploading}
                      />
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-brand-textMuted font-bold uppercase">Base Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={editingCourse.price}
                    onChange={(e) => setEditingCourse({ ...editingCourse, price: e.target.value })}
                    placeholder="e.g. 3999"
                    className="w-full bg-brand-surface border border-brand-purple/20 text-white rounded-xl py-2.5 px-4 focus:outline-none focus:border-brand-pink text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-brand-textMuted font-bold uppercase">Offer Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={editingCourse.discountPrice}
                    onChange={(e) => setEditingCourse({ ...editingCourse, discountPrice: e.target.value })}
                    placeholder="e.g. 1999"
                    className="w-full bg-brand-surface border border-brand-purple/20 text-white rounded-xl py-2.5 px-4 focus:outline-none focus:border-brand-pink text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-brand-textMuted font-bold uppercase">Category</label>
                  <select
                    value={editingCourse.category}
                    onChange={(e) => setEditingCourse({ ...editingCourse, category: e.target.value })}
                    className="w-full bg-brand-surface border border-brand-purple/20 text-white rounded-xl py-2.5 px-3 focus:outline-none focus:border-brand-pink text-sm"
                  >
                    <option value="jee">JEE</option>
                    <option value="neet">NEET</option>
                    <option value="boards-11-12">Boards 11-12</option>
                    <option value="boards-5-10">Foundation 5-10</option>
                    <option value="college">College</option>
                    <option value="commerce">Commerce</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-brand-textMuted font-bold uppercase">Subject</label>
                  <select
                    value={editingCourse.subject}
                    onChange={(e) => setEditingCourse({ ...editingCourse, subject: e.target.value })}
                    className="w-full bg-brand-surface border border-brand-purple/20 text-white rounded-xl py-2.5 px-3 focus:outline-none focus:border-brand-pink text-sm"
                  >
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Biology">Biology</option>
                    <option value="Commerce">Commerce</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-brand-textMuted font-bold uppercase">Level</label>
                  <select
                    value={editingCourse.level}
                    onChange={(e) => setEditingCourse({ ...editingCourse, level: e.target.value })}
                    className="w-full bg-brand-surface border border-brand-purple/20 text-white rounded-xl py-2.5 px-3 focus:outline-none focus:border-brand-pink text-sm"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 py-2">
                <input
                  type="checkbox"
                  id="editIsPublished"
                  checked={editingCourse.isPublished}
                  onChange={(e) => setEditingCourse({ ...editingCourse, isPublished: e.target.checked })}
                  className="w-4 h-4 rounded border-brand-purple/20 bg-brand-surface text-brand-pink focus:ring-brand-pink"
                />
                <label htmlFor="editIsPublished" className="text-xs text-brand-textMuted font-semibold select-none cursor-pointer">
                  Publish (make visible in student catalog)
                </label>
              </div>

              {editingCourse.lessons && editingCourse.lessons.length > 0 && (
                <div className="border-t border-brand-purple/10 pt-4 mt-2 space-y-2">
                  <label className="text-xs text-brand-textMuted font-bold uppercase block mb-1">Manage Syllabus Lectures</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {editingCourse.lessons.map((lesson, idx) => (
                      <div key={lesson._id || idx} className="flex justify-between items-center bg-brand-surface/60 border border-brand-purple/10 rounded-xl p-3 text-xs text-left">
                        <div className="flex items-center gap-3 truncate pr-4">
                          {lesson.thumbnailUrl ? (
                            <img src={lesson.thumbnailUrl} alt="" className="w-12 h-8 object-cover rounded-lg border border-brand-purple/20 bg-brand-surface shrink-0" />
                          ) : (
                            <div className="w-12 h-8 rounded-lg bg-brand-surface border border-brand-purple/20 flex items-center justify-center text-[8px] text-brand-textMuted shrink-0">No Img</div>
                          )}
                          <div className="space-y-0.5 truncate">
                            <span className="font-extrabold text-white block truncate">{idx + 1}. {lesson.title}</span>
                            <span className="text-[10px] text-brand-textMuted">{lesson.duration} mins • {lesson.isPreview ? 'Preview' : 'Premium'}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteLessonFromEdit(lesson._id)}
                          className="p-1 text-brand-textMuted hover:text-red-400 hover:bg-white/5 rounded transition-all shrink-0"
                          title="Delete Lesson"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full btn-primary py-3 flex items-center justify-center gap-1.5 font-bold"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ADD LESSON MODAL */}
      {showLessonModal && (
        <div className="fixed inset-0 bg-brand-dark/95 z-[999] flex items-center justify-center p-4">
          <div className="bg-[#050029] border border-brand-purple/20 rounded-3xl p-6 sm:p-8 w-full max-w-lg relative shadow-2xl overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setShowLessonModal(false)}
              className="absolute top-4 right-4 text-brand-textMuted hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-xl font-bold text-white mb-6">Attach Lesson Lecture</h3>

            <form onSubmit={handleAddLesson} className="space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-xs text-brand-textMuted font-bold uppercase">Lecture Title</label>
                <input
                  type="text"
                  required
                  value={newLesson.title}
                  onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                  placeholder="e.g. Coulomb's Law Numerical Session"
                  className="w-full bg-brand-surface border border-brand-purple/20 text-white rounded-xl py-2.5 px-4 focus:outline-none focus:border-brand-pink text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-brand-textMuted font-bold uppercase">Description</label>
                <textarea
                  required
                  rows={2}
                  value={newLesson.description}
                  onChange={(e) => setNewLesson({ ...newLesson, description: e.target.value })}
                  placeholder="Briefly summarize what this lecture covers..."
                  className="w-full bg-brand-surface border border-brand-purple/20 text-white rounded-xl py-2.5 px-4 focus:outline-none focus:border-brand-pink text-sm resize-none"
                ></textarea>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-brand-textMuted font-bold uppercase block">Lecture Thumbnail</label>
                <div className="flex items-center gap-4 bg-[#0F0052]/20 border border-brand-purple/10 rounded-2xl p-4">
                  {newLesson.thumbnailUrl ? (
                    <img 
                      src={newLesson.thumbnailUrl} 
                      alt="Thumbnail Preview" 
                      className="w-24 h-14 object-cover rounded-xl border border-brand-purple/20 bg-brand-surface" 
                    />
                  ) : (
                    <div className="w-24 h-14 rounded-xl bg-brand-surface border border-brand-purple/20 flex items-center justify-center text-xs text-brand-textMuted font-semibold">
                      No Image
                    </div>
                  )}
                  <div className="relative">
                    <button
                      type="button"
                      disabled={lessonThumbnailUploading}
                      className="btn-secondary py-2 px-4 text-xs font-bold relative"
                    >
                      {lessonThumbnailUploading ? 'Uploading...' : 'Choose Image'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLessonThumbnailUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={lessonThumbnailUploading}
                      />
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                <label className="text-xs text-brand-textMuted font-bold uppercase block">Lecture Video (4K Supported)</label>
                
                {/* Drag and drop upload zone */}
                <div className="border border-dashed border-brand-purple/25 hover:border-brand-pink/50 bg-[#0F0052]/40 rounded-2xl p-5 text-center transition-all relative">
                  {videoUploading ? (
                    <div className="space-y-3 py-2">
                      <div className="flex justify-between items-center text-xs text-brand-textMuted font-bold">
                        <span>Uploading Video Lecture...</span>
                        <span className="text-brand-pink">{uploadProgress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-brand-dark rounded-full overflow-hidden border border-white/5 relative">
                        <div 
                          className="h-full bg-gradient-to-r from-brand-pink to-brand-purple rounded-full transition-all duration-300 ease-out"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-[10px] text-brand-textMuted">Uploading 4K file directly to server. Please do not close the window.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 text-brand-purple/50 mx-auto animate-pulse" />
                      <div className="text-xs text-gray-300">
                        <span className="text-brand-pink font-bold hover:underline cursor-pointer relative">
                          Click to select video
                          <input
                            type="file"
                            accept="video/*"
                            onChange={handleVideoUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                        </span>
                        {" "}or drag & drop
                      </div>
                      <p className="text-[10px] text-brand-textMuted">Supports MP4, WEBM, MOV, MKV, AVI (up to 5GB)</p>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-brand-textMuted font-bold uppercase">Or paste video stream URL</label>
                  <input
                    type="text"
                    required
                    value={newLesson.videoUrl}
                    onChange={(e) => setNewLesson({ ...newLesson, videoUrl: e.target.value })}
                    placeholder="URL link to mp4 or youtube embed"
                    className="w-full bg-brand-surface border border-brand-purple/20 text-white rounded-xl py-2.5 px-4 focus:outline-none focus:border-brand-pink text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 items-center">
                <div className="space-y-1">
                  <label className="text-xs text-brand-textMuted font-bold uppercase">Duration (mins)</label>
                  <input
                    type="number"
                    required
                    value={newLesson.duration}
                    onChange={(e) => setNewLesson({ ...newLesson, duration: e.target.value })}
                    placeholder="e.g. 45"
                    className="w-full bg-brand-surface border border-brand-purple/20 text-white rounded-xl py-2.5 px-4 focus:outline-none focus:border-brand-pink text-sm"
                  />
                </div>
                
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="isPreview"
                    checked={newLesson.isPreview}
                    onChange={(e) => setNewLesson({ ...newLesson, isPreview: e.target.checked })}
                    className="w-4 h-4 rounded border-brand-purple/20 bg-brand-surface text-brand-pink focus:ring-brand-pink"
                  />
                  <label htmlFor="isPreview" className="text-xs text-brand-textMuted font-semibold select-none cursor-pointer">
                    Set as Free Preview Lesson
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="w-full btn-primary py-3 flex items-center justify-center gap-1.5 font-bold"
              >
                Add Lesson to Syllabus
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CREATE ASSIGNMENT MODAL */}
      {showAssignmentModal && (
        <div className="fixed inset-0 bg-brand-dark/95 z-[999] flex items-center justify-center p-4">
          <div className="bg-[#050029] border border-brand-purple/20 rounded-3xl p-6 sm:p-8 w-full max-w-lg relative shadow-2xl overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setShowAssignmentModal(false)}
              className="absolute top-4 right-4 text-brand-textMuted hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-xl font-bold text-white mb-6">Create New Assignment</h3>

            <form onSubmit={handleCreateAssignment} className="space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-xs text-brand-textMuted font-bold uppercase">Assignment Title</label>
                <input
                  type="text"
                  required
                  value={newAssignment.title}
                  onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                  placeholder="e.g. Coulomb's Law Problem Set"
                  className="w-full bg-brand-surface border border-brand-purple/20 text-white rounded-xl py-2.5 px-4 focus:outline-none focus:border-brand-pink text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-brand-textMuted font-bold uppercase">Associated Course</label>
                <select
                  required
                  value={newAssignment.courseId}
                  onChange={(e) => setNewAssignment({ ...newAssignment, courseId: e.target.value })}
                  className="w-full bg-brand-surface border border-brand-purple/20 text-white rounded-xl py-2.5 px-3 focus:outline-none focus:border-brand-pink text-sm"
                >
                  <option value="">-- Select Course --</option>
                  {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-brand-textMuted font-bold uppercase">Instructions / Description</label>
                <textarea
                  required
                  rows={3}
                  value={newAssignment.description}
                  onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                  placeholder="Write clear instructions for students..."
                  className="w-full bg-brand-surface border border-brand-purple/20 text-white rounded-xl py-2.5 px-4 focus:outline-none focus:border-brand-pink text-sm resize-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-brand-textMuted font-bold uppercase">Due Date</label>
                  <input
                    type="date"
                    required
                    value={newAssignment.dueDate}
                    onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                    className="w-full bg-brand-surface border border-brand-purple/20 text-white rounded-xl py-2.5 px-4 focus:outline-none focus:border-brand-pink text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-brand-textMuted font-bold uppercase">Total Marks</label>
                  <input
                    type="number"
                    required
                    value={newAssignment.totalMarks}
                    onChange={(e) => setNewAssignment({ ...newAssignment, totalMarks: e.target.value })}
                    className="w-full bg-brand-surface border border-brand-purple/20 text-white rounded-xl py-2.5 px-4 focus:outline-none focus:border-brand-pink text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full btn-primary py-3 flex items-center justify-center gap-1.5 font-bold"
              >
                Publish Assignment
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CREATE MCQ TEST MODAL */}
      {showTestModal && (
        <div className="fixed inset-0 bg-brand-dark/95 z-[999] flex items-center justify-center p-4">
          <div className="bg-[#050029] border border-brand-purple/20 rounded-3xl p-6 sm:p-8 w-full max-w-2xl relative shadow-2xl overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setShowTestModal(false)}
              className="absolute top-4 right-4 text-brand-textMuted hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-xl font-bold text-white mb-6">Create MCQ Quiz Exam</h3>

            <form onSubmit={handleCreateTest} className="space-y-6 text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-brand-textMuted font-bold uppercase">Quiz Exam Title</label>
                  <input
                    type="text"
                    required
                    value={newTest.title}
                    onChange={(e) => setNewTest({ ...newTest, title: e.target.value })}
                    placeholder="e.g. Electrostatics Chapter Quiz"
                    className="w-full bg-brand-surface border border-brand-purple/20 text-white rounded-xl py-2.5 px-4 focus:outline-none focus:border-brand-pink text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-brand-textMuted font-bold uppercase">Select Course</label>
                  <select
                    required
                    value={newTest.courseId}
                    onChange={(e) => setNewTest({ ...newTest, courseId: e.target.value })}
                    className="w-full bg-brand-surface border border-brand-purple/20 text-white rounded-xl py-2.5 px-3 focus:outline-none focus:border-brand-pink text-sm"
                  >
                    <option value="">-- Choose Course --</option>
                    {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-brand-textMuted font-bold uppercase">Duration (mins)</label>
                  <input
                    type="number"
                    required
                    value={newTest.duration}
                    onChange={(e) => setNewTest({ ...newTest, duration: e.target.value })}
                    className="w-full bg-brand-surface border border-brand-purple/20 text-white rounded-xl py-2.5 px-4 focus:outline-none focus:border-brand-pink text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-brand-textMuted font-bold uppercase">Test Type</label>
                  <select
                    value={newTest.testType}
                    onChange={(e) => setNewTest({ ...newTest, testType: e.target.value })}
                    className="w-full bg-brand-surface border border-brand-purple/20 text-white rounded-xl py-2.5 px-3 focus:outline-none focus:border-brand-pink text-sm"
                  >
                    <option value="chapter">Chapter Test</option>
                    <option value="mock">Full Mock Exam</option>
                    <option value="dpp">Daily Practice (DPP)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-brand-textMuted font-bold uppercase">Category</label>
                  <select
                    value={newTest.category}
                    onChange={(e) => setNewTest({ ...newTest, category: e.target.value })}
                    className="w-full bg-brand-surface border border-brand-purple/20 text-white rounded-xl py-2.5 px-3 focus:outline-none focus:border-brand-pink text-sm"
                  >
                    <option value="jee">JEE</option>
                    <option value="neet">NEET</option>
                    <option value="class-11-12">Class 11-12</option>
                  </select>
                </div>
              </div>

              {/* Questions Definition */}
              <div className="border-t border-white/5 pt-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-black text-white">Questions list ({newTest.questions.length})</h4>
                  <button
                    type="button"
                    onClick={() => setNewTest({
                      ...newTest,
                      questions: [
                        ...newTest.questions,
                        { text: '', options: [{ label: 'A', text: '' }, { label: 'B', text: '' }, { label: 'C', text: '' }, { label: 'D', text: '' }], correctOption: 'A', marks: 4, negativeMark: 1, difficulty: 'medium', topic: '' }
                      ]
                    })}
                    className="text-xs text-brand-pink font-bold flex items-center gap-1 hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Question
                  </button>
                </div>

                {newTest.questions.map((q, idx) => (
                  <div key={idx} className="p-4 bg-brand-surface/30 border border-brand-purple/10 rounded-2xl space-y-3 relative">
                    <button
                      type="button"
                      onClick={() => setNewTest({
                        ...newTest,
                        questions: newTest.questions.filter((_, qIdx) => qIdx !== idx)
                      })}
                      className="absolute top-2 right-2 text-brand-textMuted hover:text-white"
                      disabled={newTest.questions.length === 1}
                    >
                      <X className="w-4 h-4" />
                    </button>

                    <div className="space-y-1">
                      <label className="text-[10px] text-brand-textMuted font-bold uppercase">Question {idx + 1} Text</label>
                      <input
                        type="text"
                        required
                        value={q.text}
                        onChange={(e) => {
                          const updated = [...newTest.questions];
                          updated[idx].text = e.target.value;
                          setNewTest({ ...newTest, questions: updated });
                        }}
                        placeholder="e.g. What is the value of electrostatic constant k in vacuum?"
                        className="w-full bg-brand-dark border border-brand-purple/20 text-white rounded-xl py-2 px-3 focus:outline-none text-xs"
                      />
                    </div>

                    {/* MCQ Options */}
                    <div className="grid grid-cols-2 gap-3">
                      {q.options.map((opt, oIdx) => (
                        <div key={oIdx} className="space-y-1">
                          <label className="text-[9px] text-brand-textMuted font-bold uppercase">Option {opt.label}</label>
                          <input
                            type="text"
                            required
                            value={opt.text}
                            onChange={(e) => {
                              const updated = [...newTest.questions];
                              updated[idx].options[oIdx].text = e.target.value;
                              setNewTest({ ...newTest, questions: updated });
                            }}
                            placeholder={`Text for option ${opt.label}...`}
                            className="w-full bg-brand-dark border border-brand-purple/20 text-white rounded-xl py-2 px-3 focus:outline-none text-xs"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-4 gap-3 items-center">
                      <div className="space-y-1 col-span-1">
                        <label className="text-[9px] text-brand-textMuted font-bold uppercase">Correct Option</label>
                        <select
                          value={q.correctOption}
                          onChange={(e) => {
                            const updated = [...newTest.questions];
                            updated[idx].correctOption = e.target.value;
                            setNewTest({ ...newTest, questions: updated });
                          }}
                          className="w-full bg-brand-dark border border-brand-purple/20 text-white rounded-xl py-2 px-2 focus:outline-none text-xs"
                        >
                          <option value="A">Option A</option>
                          <option value="B">Option B</option>
                          <option value="C">Option C</option>
                          <option value="D">Option D</option>
                        </select>
                      </div>

                      <div className="space-y-1 col-span-1">
                        <label className="text-[9px] text-brand-textMuted font-bold uppercase">Marks</label>
                        <input
                          type="number"
                          value={q.marks}
                          onChange={(e) => {
                            const updated = [...newTest.questions];
                            updated[idx].marks = Number(e.target.value);
                            setNewTest({ ...newTest, questions: updated });
                          }}
                          className="w-full bg-brand-dark border border-brand-purple/20 text-white rounded-xl py-2 px-2 focus:outline-none text-xs"
                        />
                      </div>

                      <div className="space-y-1 col-span-1">
                        <label className="text-[9px] text-brand-textMuted font-bold uppercase">Negative Mark</label>
                        <input
                          type="number"
                          value={q.negativeMark}
                          onChange={(e) => {
                            const updated = [...newTest.questions];
                            updated[idx].negativeMark = Number(e.target.value);
                            setNewTest({ ...newTest, questions: updated });
                          }}
                          className="w-full bg-brand-dark border border-brand-purple/20 text-white rounded-xl py-2 px-2 focus:outline-none text-xs"
                        />
                      </div>

                      <div className="space-y-1 col-span-1">
                        <label className="text-[9px] text-brand-textMuted font-bold uppercase">Difficulty</label>
                        <select
                          value={q.difficulty}
                          onChange={(e) => {
                            const updated = [...newTest.questions];
                            updated[idx].difficulty = e.target.value;
                            setNewTest({ ...newTest, questions: updated });
                          }}
                          className="w-full bg-brand-dark border border-brand-purple/20 text-white rounded-xl py-2 px-2 focus:outline-none text-xs"
                        >
                          <option value="easy">Easy</option>
                          <option value="medium">Medium</option>
                          <option value="hard">Hard</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="submit"
                className="w-full btn-primary py-3 flex items-center justify-center gap-1.5 font-bold"
              >
                Publish MCQ Test
              </button>
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
                This is a preview of the recorded live lecture session.
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
