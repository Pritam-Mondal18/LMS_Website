import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../../redux/slices/authSlice';
import { LogIn, Mail, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import SEO from '../../components/common/SEO';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading, error, needsVerification, tempUserId } = useSelector((state) => state.auth);

  const redirectUrl = searchParams.get('redirect') || '/';

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      navigate(redirectUrl);
    }
  }, [user, navigate, redirectUrl]);

  useEffect(() => {
    if (needsVerification && tempUserId) {
      navigate(`/verify-otp?userId=${tempUserId}`);
    }
  }, [needsVerification, tempUserId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(loginUser({ email, password }));
    
    // Check if verification is needed (user not verified case)
    if (result.payload?.needsVerification) {
      navigate(`/verify-otp?userId=${result.payload.userId}`);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 flex flex-col justify-center min-h-[70vh]">
      <SEO 
        title="Sign In" 
        description="Access your dashboard, enrolled courses, assignments, and test series at Sumit Chakraborty Academy."
        keywords="login, student portal, teacher dashboard, access courses"
      />
      <div className="glass-card p-8 rounded-3xl border border-brand-purple/20 shadow-2xl relative">
        {/* Glow */}
        <div className="absolute -top-10 -left-10 w-24 h-24 bg-brand-pink/20 blur-2xl rounded-full"></div>
        <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-brand-purple/20 blur-2xl rounded-full"></div>

        <div className="text-center space-y-2 mb-8">
          <div className="w-12 h-12 bg-gradient-to-tr from-brand-pink to-brand-purple rounded-xl flex items-center justify-center font-black text-white text-xl mx-auto shadow-md">
            S
          </div>
          <h2 className="text-2xl font-black text-white">Welcome Back</h2>
          <p className="text-brand-textMuted text-xs uppercase tracking-widest font-bold">Sumit Chakraborty Academy</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 rounded-xl flex items-start gap-2.5 mb-6 text-left">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-left">
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
            <div className="flex justify-between items-center">
              <label className="text-xs text-brand-textMuted font-bold uppercase tracking-wider">Password</label>
              <Link to="/forgot-password" className="text-xs text-brand-pink hover:underline font-bold">Forgot Password?</Link>
            </div>
            <div className="relative flex items-center">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
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
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3.5 mt-2 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></span>
            ) : (
              <>
                Sign In <LogIn className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-6 text-xs text-brand-textMuted">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-pink font-bold hover:underline">
            Register Here
          </Link>
        </div>
      </div>
    </div>
  );
}
