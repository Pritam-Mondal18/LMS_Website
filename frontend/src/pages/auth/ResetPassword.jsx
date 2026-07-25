import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { Lock, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';

export default function ResetPassword() {
  const { token } = useParams();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(`/auth/reset-password/${token}`, { password });
      if (response.data.success) {
        setSuccess(true);
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Invalid or expired reset token.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 flex flex-col justify-center min-h-[70vh]">
      <div className="glass-card p-8 rounded-3xl border border-brand-purple/20 shadow-2xl relative text-left">
        <div className="absolute -top-10 -left-10 w-24 h-24 bg-brand-pink/20 blur-2xl rounded-full"></div>
        <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-brand-purple/20 blur-2xl rounded-full"></div>

        <div className="text-center space-y-2 mb-8">
          <div className="w-12 h-12 bg-gradient-to-tr from-brand-pink to-brand-purple rounded-xl flex items-center justify-center font-black text-white text-xl mx-auto shadow-md">
            S
          </div>
          <h2 className="text-2xl font-black text-white">Create New Password</h2>
          <p className="text-brand-textMuted text-xs uppercase tracking-widest font-bold">Sumit Chakraborty Academy</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 rounded-xl flex items-start gap-2.5 mb-6">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="text-center py-6 space-y-6 animate-in zoom-in duration-300">
            <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto" />
            <h3 className="text-xl font-bold text-white">Password Updated!</h3>
            <p className="text-brand-textMuted text-sm leading-relaxed">
              Your security credentials have been updated successfully. You can now sign in with your new password.
            </p>
            <Link to="/login" className="w-full btn-primary py-3 justify-center">
              Go to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Password */}
            <div className="space-y-2">
              <label className="text-xs text-brand-textMuted font-bold uppercase tracking-wider">New Password</label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
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

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="text-xs text-brand-textMuted font-bold uppercase tracking-wider">Confirm Password</label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  className="w-full bg-brand-surface border border-brand-purple/20 text-white rounded-xl py-3 pl-11 pr-11 focus:outline-none focus:border-brand-pink transition-all text-sm"
                />
                <Lock className="w-5 h-5 text-brand-textMuted absolute left-4 pointer-events-none" />
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
                'Reset Password'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
