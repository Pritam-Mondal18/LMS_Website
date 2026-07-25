import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '../../redux/slices/authSlice';
import { UserPlus, Mail, Lock, User, AlertCircle, Eye, EyeOff } from 'lucide-react';
import SEO from '../../components/common/SEO';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error, needsVerification, tempUserId } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (needsVerification && tempUserId) {
      navigate(`/verify-otp?userId=${tempUserId}`);
    }
  }, [needsVerification, tempUserId, navigate]);

  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasNumber;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isPasswordValid) return;
    dispatch(registerUser({ name, email, password, role }));
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 flex flex-col justify-center min-h-[80vh]">
      <SEO 
        title="Sign Up" 
        description="Join Sumit Chakraborty Academy as a student to enroll in courses or as a teacher to schedule live classes."
        keywords="register, create account, signup, student registration"
      />
      <div className="glass-card p-8 rounded-3xl border border-brand-purple/20 shadow-2xl relative">
        {/* Glow */}
        <div className="absolute -top-10 -left-10 w-24 h-24 bg-brand-pink/20 blur-2xl rounded-full"></div>
        <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-brand-purple/20 blur-2xl rounded-full"></div>

        <div className="text-center space-y-2 mb-8">
          <div className="w-12 h-12 bg-gradient-to-tr from-brand-pink to-brand-purple rounded-xl flex items-center justify-center font-black text-white text-xl mx-auto shadow-md">
            S
          </div>
          <h2 className="text-2xl font-black text-white">Create Account</h2>
          <p className="text-brand-textMuted text-xs uppercase tracking-widest font-bold">Sumit Chakraborty Academy</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 rounded-xl flex items-start gap-2.5 mb-6 text-left">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          {/* Full Name */}
          <div className="space-y-2">
            <label className="text-xs text-brand-textMuted font-bold uppercase tracking-wider">Full Name</label>
            <div className="relative flex items-center">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter name"
                className="w-full bg-brand-surface border border-brand-purple/20 text-white rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-brand-pink transition-all text-sm"
              />
              <User className="w-5 h-5 text-brand-textMuted absolute left-4 pointer-events-none" />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-xs text-brand-textMuted font-bold uppercase tracking-wider">Email Address</label>
            <div className="relative flex items-center">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
                className="w-full bg-brand-surface border border-brand-purple/20 text-white rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-brand-pink transition-all text-sm"
              />
              <Mail className="w-5 h-5 text-brand-textMuted absolute left-4 pointer-events-none" />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-xs text-brand-textMuted font-bold uppercase tracking-wider">Password</label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Choose password"
                className="w-full bg-brand-surface border border-brand-purple/20 text-white rounded-xl py-3 pl-11 pr-11 focus:outline-none focus:border-brand-pink transition-all text-sm"
              />
              <Lock className="w-5 h-5 text-brand-textMuted absolute left-4 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-brand-textMuted hover:text-white"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {/* Dynamic Password Validation Indicators */}
            {password && (
              <div className="mt-3 space-y-2 p-3.5 bg-brand-surface/40 rounded-xl border border-brand-purple/10 text-xs transition-all duration-300">
                <p className="font-bold text-[10px] text-brand-textMuted uppercase tracking-wider mb-1">Password Requirements:</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-1.5 transition-all">
                    <span className={`w-1.5 h-1.5 rounded-full ${hasMinLength ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                    <span className={hasMinLength ? 'text-emerald-400/90' : 'text-red-400/90'}>Min 8 characters</span>
                  </div>
                  <div className="flex items-center gap-1.5 transition-all">
                    <span className={`w-1.5 h-1.5 rounded-full ${hasUppercase ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                    <span className={hasUppercase ? 'text-emerald-400/90' : 'text-red-400/90'}>One uppercase letter</span>
                  </div>
                  <div className="flex items-center gap-1.5 transition-all">
                    <span className={`w-1.5 h-1.5 rounded-full ${hasLowercase ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                    <span className={hasLowercase ? 'text-emerald-400/90' : 'text-red-400/90'}>One lowercase letter</span>
                  </div>
                  <div className="flex items-center gap-1.5 transition-all">
                    <span className={`w-1.5 h-1.5 rounded-full ${hasNumber ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                    <span className={hasNumber ? 'text-emerald-400/90' : 'text-red-400/90'}>One number</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Role */}
          <div className="space-y-2">
            <label className="text-xs text-brand-textMuted font-bold uppercase tracking-wider">I want to join as</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`py-3 rounded-xl text-sm font-bold border transition-all ${
                  role === 'student'
                    ? 'bg-brand-pink/15 border-brand-pink text-white shadow-lg'
                    : 'bg-brand-surface border-brand-purple/20 text-brand-textMuted hover:border-brand-purple'
                }`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => setRole('teacher')}
                className={`py-3 rounded-xl text-sm font-bold border transition-all ${
                  role === 'teacher'
                    ? 'bg-brand-purple/20 border-brand-purple text-white shadow-lg'
                    : 'bg-brand-surface border-brand-purple/20 text-brand-textMuted hover:border-brand-purple'
                }`}
              >
                Teacher
              </button>
            </div>
            {role === 'teacher' && (
              <p className="text-[10px] text-brand-textMuted mt-1 leading-snug">
                * Note: Teacher registrations require verification and administrative approval before courses can be published.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || (password && !isPasswordValid)}
            className="w-full btn-primary py-3.5 mt-2 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></span>
            ) : (
              <>
                Register Account <UserPlus className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-6 text-xs text-brand-textMuted">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-pink font-bold hover:underline">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
}
