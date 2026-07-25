import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Mail, AlertCircle, ArrowLeft, Send } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      const response = await api.post('/auth/forgot-password', { email });
      if (response.data.success) {
        setMessage('A password reset link has been dispatched to your email address.');
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to send reset email. Please verify the address.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 flex flex-col justify-center min-h-[70vh]">
      <div className="glass-card p-8 rounded-3xl border border-brand-purple/20 shadow-2xl relative text-left">
        <div className="absolute -top-10 -left-10 w-24 h-24 bg-brand-pink/20 blur-2xl rounded-full"></div>
        <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-brand-purple/20 blur-2xl rounded-full"></div>

        <div className="space-y-2 mb-8">
          <Link to="/login" className="inline-flex items-center gap-1 text-xs text-brand-pink hover:text-white transition-colors mb-4 font-bold">
            <ArrowLeft className="w-4 h-4" /> Back to Sign In
          </Link>
          <h2 className="text-2xl font-black text-white">Reset Password</h2>
          <p className="text-brand-textMuted text-xs font-semibold leading-relaxed">
            Enter the email associated with your account, and we will send you a secure link to reset your password.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 rounded-xl flex items-start gap-2.5 mb-6">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {message ? (
          <div className="bg-brand-purple/10 border border-brand-purple/20 text-brand-textMuted text-sm p-4 rounded-xl space-y-4">
            <p className="leading-relaxed">{message}</p>
            <Link to="/login" className="w-full btn-primary py-2.5 text-xs text-center justify-center">
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
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

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3.5 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></span>
              ) : (
                <>
                  Send Reset Link <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
