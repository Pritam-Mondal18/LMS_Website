import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import SEO from '../components/common/SEO';
import api from '../services/api';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/auth/contact', formData);
      setSuccess(true);
      setFormData({ name: '', email: '', phone: '', subject: 'General Inquiry', message: '' });
      setTimeout(() => setSuccess(false), 6000);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to send. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const contactDetails = [
    { title: 'Email Support', info: 'support@sumitchakrabortyacademy.com', sub: 'Response within 12 hours', icon: Mail, color: 'text-brand-pink bg-brand-pink/10' },
    { title: 'Phone Query', info: '+91 98300 98300', sub: 'Mon-Sat (10:00 AM - 7:00 PM)', icon: Phone, color: 'text-brand-purple bg-brand-purple/10' },
    { title: 'Registered Office', info: 'Sector V, Salt Lake, Kolkata', sub: 'West Bengal, 700091', icon: MapPin, color: 'text-blue-400 bg-blue-500/10' },
    { title: 'Support Hours', info: '9:00 AM - 9:00 PM IST', sub: '7 Days a week support availability', icon: Clock, color: 'text-yellow-400 bg-yellow-500/10' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-left space-y-16">
      <SEO 
        title="Contact Us" 
        description="Reach out to Sumit Chakraborty Academy for admission inquiries, technical support, or program counseling."
        keywords="contact Sumit Chakraborty Academy, support email, phone queries,Salt Lake Salt Lake office"
      />
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs uppercase font-extrabold tracking-widest text-brand-pink bg-brand-pink/10 px-3 py-1 rounded-full">Get In Touch</span>
        <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight">We Are Here to Assist You</h1>
        <p className="text-brand-textMuted text-base">
          Have queries regarding batches, courses, or payment options? Drop a message and our education consultants will call you back.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Details Cards */}
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
          {contactDetails.map((detail, idx) => {
            const Icon = detail.icon;
            return (
              <div key={idx} className="glass-card p-6 rounded-2xl border border-brand-purple/10 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${detail.color}`}>
                  <Icon className="w-5.5 h-5.5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">{detail.title}</h4>
                  <p className="text-sm font-semibold text-white/90 mt-1">{detail.info}</p>
                  <p className="text-xs text-brand-textMuted mt-0.5">{detail.sub}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Contact Form */}
        <div className="lg:col-span-7">
          <div className="glass-card p-8 rounded-3xl border border-brand-purple/15 relative overflow-hidden shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-6">Send An Inquiry Message</h3>

            {success ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-8 text-center space-y-4 animate-in zoom-in duration-350">
                <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto" />
                <h4 className="text-lg font-bold text-white">Inquiry Sent Successfully!</h4>
                <p className="text-brand-textMuted text-sm">
                  Thank you for contacting Sumit Chakraborty Academy. One of our counselors will contact you shortly via email or phone.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs text-brand-textMuted font-bold uppercase tracking-wider">Your Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter name"
                      className="w-full bg-brand-surface border border-brand-purple/20 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-brand-pink transition-all text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-brand-textMuted font-bold uppercase tracking-wider">Your Email</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Enter email"
                      className="w-full bg-brand-surface border border-brand-purple/20 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-brand-pink transition-all text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs text-brand-textMuted font-bold uppercase tracking-wider">Contact Number</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="10-digit number"
                      className="w-full bg-brand-surface border border-brand-purple/20 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-brand-pink transition-all text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-brand-textMuted font-bold uppercase tracking-wider">Interest Category</label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full bg-brand-surface border border-brand-purple/20 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-brand-pink transition-all text-sm"
                    >
                      <option value="General Inquiry">General Admission Inquiry</option>
                      <option value="JEE Preparation">JEE Main/Advanced Course</option>
                      <option value="NEET Preparation">NEET Biology & Physics</option>
                      <option value="Boards 11-12">Class 11/12 Board Slots</option>
                      <option value="Boards 5-10">Class 5-10 Foundation</option>
                      <option value="Technical Support">Platform Technical Support</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-brand-textMuted font-bold uppercase tracking-wider">Inquiry Message</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe your query or background"
                    className="w-full bg-brand-surface border border-brand-purple/20 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-brand-pink transition-all text-sm resize-none"
                  ></textarea>
                </div>

                {error && (
                  <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full btn-primary py-3.5 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></span>
                  ) : (
                    <>
                      Send Inquiry Message <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
