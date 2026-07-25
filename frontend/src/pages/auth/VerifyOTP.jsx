import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { verifyOTP, clearError } from '../../redux/slices/authSlice';
import api from '../../services/api';
import { MailOpen, AlertCircle, ArrowRight } from 'lucide-react';

export default function VerifyOTP() {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId');
  
  const [otp, setOtp] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(clearError());
    if (!userId) {
      navigate('/login');
    }
  }, [dispatch, userId, navigate]);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (otp.length !== 6) return;
    dispatch(verifyOTP({ userId, otp }));
  };

  const handleResend = async () => {
    setResendLoading(true);
    setResendMessage('');
    try {
      const response = await api.post('/auth/resend-otp', { userId });
      if (response.data.success) {
        setResendMessage('A new verification code has been dispatched to your email.');
      }
    } catch (e) {
      setResendMessage(e.response?.data?.message || 'Failed to resend verification code.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 flex flex-col justify-center min-h-[70vh]">
      <div className="glass-card p-8 rounded-3xl border border-brand-purple/20 shadow-2xl relative">
        <div className="text-center space-y-2 mb-8">
          <div className="w-12 h-12 bg-gradient-to-tr from-brand-pink to-brand-purple rounded-xl flex items-center justify-center font-black text-white text-xl mx-auto shadow-md">
            <MailOpen className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-white">Verify Your Email</h2>
          <p className="text-brand-textMuted text-xs font-bold leading-relaxed">
            We have sent a 6-digit confirmation code to your email. Please check your inbox and enter it below.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 rounded-xl flex items-start gap-2.5 mb-6 text-left">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {resendMessage && (
          <div className="bg-brand-purple/10 border border-brand-purple/20 text-brand-textMuted text-xs p-3 rounded-xl mb-6 text-left">
            {resendMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          <div className="space-y-2">
            <label className="text-xs text-brand-textMuted font-bold uppercase tracking-wider block text-center">6-Digit Verification Code</label>
            <input
              type="text"
              required
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="e.g. 123456"
              className="w-full bg-brand-surface border border-brand-purple/20 text-white text-center text-xl font-bold tracking-[0.4em] rounded-xl py-3.5 focus:outline-none focus:border-brand-pink transition-all placeholder:tracking-normal placeholder:text-sm placeholder:text-brand-textMuted/40"
            />
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full btn-primary py-3.5 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></span>
            ) : (
              <>
                Verify & Sign In <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-8 border-t border-white/5 pt-5 flex items-center justify-between text-xs">
          <span className="text-brand-textMuted font-medium">Didn't receive the code?</span>
          <button
            onClick={handleResend}
            disabled={resendLoading}
            className="text-brand-pink font-bold hover:underline disabled:opacity-50"
          >
            {resendLoading ? 'Sending...' : 'Resend Code'}
          </button>
        </div>
      </div>
    </div>
  );
}
