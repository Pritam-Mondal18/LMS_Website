import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../../redux/slices/authSlice';
import { Menu, X, BookOpen, User, LogOut, ChevronDown, Bell } from 'lucide-react';
import Logo from './Logo';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setDropdownOpen(false);
  }, [location]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    return `/${user.role}/${user._id || user.id}`;
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Courses', path: '/courses' },
    { label: 'Blogs', path: '/blogs' },
    { label: 'Reviews', path: '/reviews' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'glass-nav py-3 shadow-xl shadow-brand-dark/20' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center group">
            <Logo size="md" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = link.path.includes('#')
                ? location.hash === '#' + link.path.split('#')[1]
                : (location.pathname === link.path && (!location.hash || link.path !== '/'));
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-semibold tracking-wide transition-colors duration-200 hover:text-brand-pink ${isActive ? 'text-brand-pink' : 'text-gray-300'}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="relative flex items-center gap-4">
                <Link to={getDashboardLink()} className="text-gray-300 hover:text-brand-pink relative p-2 rounded-full hover:bg-white/5 transition-colors">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-brand-pink rounded-full"></span>
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 bg-brand-violet/40 hover:bg-brand-violet/60 border border-brand-purple/20 py-1.5 px-3 rounded-full text-white font-semibold transition-all duration-300"
                  >
                    <div className="w-8 h-8 rounded-full bg-brand-purple/40 flex items-center justify-center text-sm font-bold text-white border border-brand-purple/30">
                      {user.name.charAt(0)}
                    </div>
                    <span className="text-sm max-w-[120px] truncate">{user.name}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {dropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)}></div>
                      <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-brand-surface border border-brand-purple/20 p-2 shadow-2xl z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="px-3 py-2 border-b border-white/10 mb-1">
                          <p className="text-[10px] uppercase tracking-widest text-brand-pink font-extrabold">{user.role}</p>
                          <p className="text-sm font-bold text-white truncate">{user.name}</p>
                          <p className="text-xs text-brand-textMuted truncate">{user.email}</p>
                        </div>
                        <Link
                          to={getDashboardLink()}
                          className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-300 hover:bg-brand-purple/20 hover:text-white rounded-xl transition-all"
                        >
                          <BookOpen className="w-4 h-4" />
                          Dashboard
                        </Link>
                        {user.role === 'student' && (
                          <Link
                            to="/student/profile"
                            className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-300 hover:bg-brand-purple/20 hover:text-white rounded-xl transition-all"
                          >
                            <User className="w-4 h-4" />
                            My Profile
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-all text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-sm font-bold text-gray-300 hover:text-white px-4 py-2 transition-colors">
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary py-2 px-5 text-sm">
                  Register Now
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-3">
            {user && (
              <Link to={getDashboardLink()} className="w-8 h-8 rounded-full bg-brand-pink/20 border border-brand-pink/40 flex items-center justify-center font-bold text-sm text-brand-pink">
                {user.name.charAt(0)}
              </Link>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-white p-2"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden glass-nav border-t border-brand-purple/10 px-4 pt-4 pb-6 space-y-3 animate-in slide-in-from-top duration-300">
          {navLinks.map((link) => {
            const isActive = link.path.includes('#')
              ? location.hash === '#' + link.path.split('#')[1]
              : (location.pathname === link.path && (!location.hash || link.path !== '/'));
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`block py-2 text-base font-semibold border-b border-white/5 ${isActive ? 'text-brand-pink' : 'text-gray-300'}`}
              >
                {link.label}
              </Link>
            );
          })}
          {user ? (
            <div className="pt-2 space-y-2">
              <Link
                to={getDashboardLink()}
                className="flex items-center gap-2 py-2 text-base font-semibold text-gray-300"
              >
                <BookOpen className="w-5 h-5 text-brand-pink" />
                Go to Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 py-2 text-base font-semibold text-red-400 text-left"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-4 flex flex-col gap-3">
              <Link to="/login" className="w-full btn-secondary text-center">
                Sign In
              </Link>
              <Link to="/register" className="w-full btn-primary text-center">
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
