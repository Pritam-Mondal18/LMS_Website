import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { resetAuthState } from './redux/slices/authSlice';
import ErrorBoundary from './components/common/ErrorBoundary';
import ScrollToTop from './components/common/ScrollToTop';
import ProtectedRoute from './components/common/ProtectedRoute';
import { Toaster } from 'react-hot-toast';

// Layout — loaded eagerly (always needed)
import RootLayout from './layouts/RootLayout';

// Lazy-loaded pages for code splitting
const Home = lazy(() => import('./pages/Home'));
const Courses = lazy(() => import('./pages/Courses'));
const CourseDetail = lazy(() => import('./pages/CourseDetail'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Blogs = lazy(() => import('./pages/Blogs'));
const Reviews = lazy(() => import('./pages/Reviews'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Auth pages (lazy)
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const VerifyOTP = lazy(() => import('./pages/auth/VerifyOTP'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));

// Dashboard pages (lazy — heaviest components)
const StudentDashboard = lazy(() => import('./pages/student/Dashboard'));
const CoursePlayer = lazy(() => import('./pages/student/CoursePlayer'));
const TeacherDashboard = lazy(() => import('./pages/teacher/Dashboard'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const Meeting = lazy(() => import('./pages/Meeting'));

// Loading fallback for Suspense
function PageLoader() {
  return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-brand-purple/30 border-t-brand-pink rounded-full animate-spin" />
        <p className="text-brand-textMuted text-sm font-medium animate-pulse">Loading...</p>
      </div>
    </div>
  );
}

// Redirect wrapper to enforce ID in the dashboard URL
function DashboardRedirect({ role }) {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={`/${role}/${user._id || user.id}${location.search}`} replace />;
}

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const handleAuthLogout = () => {
      dispatch(resetAuthState());
      localStorage.removeItem('user');
    };
    window.addEventListener('auth-logout', handleAuthLogout);
    return () => window.removeEventListener('auth-logout', handleAuthLogout);
  }, [dispatch]);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ScrollToTop />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#130C35',
              color: '#FFFFFF',
              border: '1px solid rgba(177, 59, 255, 0.2)',
              borderRadius: '12px',
              fontFamily: 'system-ui, sans-serif',
            },
            success: {
              iconTheme: {
                primary: '#B13BFF',
                secondary: '#FFFFFF',
              },
            },
          }}
        />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Protected Student Routes */}
            <Route
              path="student"
              element={<DashboardRedirect role="student" />}
            />
            <Route
              path="student/:userId"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="student/courses/:id"
              element={
                <ProtectedRoute allowedRoles={['student', 'teacher', 'admin']}>
                  <CoursePlayer />
                </ProtectedRoute>
              }
            />
            <Route path="student/courses" element={<Navigate to="/student?tab=courses" replace />} />
            <Route path="student/notifications" element={<Navigate to="/student" replace />} />
            <Route path="student/profile" element={<Navigate to="/student" replace />} />

            {/* Protected Teacher Routes */}
            <Route
              path="teacher"
              element={<DashboardRedirect role="teacher" />}
            />
            <Route
              path="teacher/:userId"
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <TeacherDashboard />
                </ProtectedRoute>
              }
            />

            {/* Protected Meeting Room Route */}
            <Route
              path="meeting/:meetingId"
              element={
                <ProtectedRoute allowedRoles={['student', 'teacher', 'admin']}>
                  <Meeting />
                </ProtectedRoute>
              }
            />

            {/* Protected Admin Routes */}
            <Route
              path="admin"
              element={<DashboardRedirect role="admin" />}
            />
            <Route
              path="admin/:userId"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Public & Guest Routes wrapped in RootLayout */}
            <Route path="/" element={<RootLayout />}>
              <Route index element={<Home />} />
              <Route path="courses" element={<Courses />} />
              <Route path="courses/:id" element={<CourseDetail />} />
              <Route path="blogs" element={<Blogs />} />
              <Route path="reviews" element={<Reviews />} />
              <Route path="about" element={<About />} />
              <Route path="contact" element={<Contact />} />

              {/* Auth views */}
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="verify-otp" element={<VerifyOTP />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
              <Route path="reset-password/:token" element={<ResetPassword />} />

              {/* 404 inside layout */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
