import { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Button } from '@/components/ui/button';

const BriefcaseIcon = ({ className = '' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
        <path d="M10 6V5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v1" />
        <rect x="3" y="6" width="18" height="14" rx="2" />
        <path d="M3 12h18" />
    </svg>
);

const MenuIcon = ({ className = '' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
        <path d="M4 6h16" />
        <path d="M4 12h16" />
        <path d="M4 18h16" />
    </svg>
);

const XIcon = ({ className = '' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
    </svg>
);

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const hiddenRoutes = ['/seeker', '/recruiter', '/admin'];
    const isDashboard = hiddenRoutes.some((route) => location.pathname.startsWith(route));

    if (isDashboard) {
        return null;
    }

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 w-full border-b border-slate-700/50 bg-slate-950/90 backdrop-blur-xl text-slate-100 shadow-elevated">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 transition-smooth hover:opacity-80 group">
                        <div className="rounded-lg bg-gradient-to-br from-indigo-500 to-emerald-500 p-2 text-white shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50">
                            <BriefcaseIcon className="h-5 w-5" />
                        </div>
                        <span className="text-lg font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">
                            TalentAI
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden items-center gap-x-8 md:flex">
                        <Link to="/jobs" className="text-sm font-medium text-slate-300 transition-colors hover:text-indigo-400">
                            Find Jobs
                        </Link>
                        <Link to="/employers" className="text-sm font-medium text-slate-300 transition-colors hover:text-indigo-400">
                            For Employers
                        </Link>
                        <Link to="/about" className="text-sm font-medium text-slate-300 transition-colors hover:text-indigo-400">
                            About
                        </Link>
                    </div>

                    {/* Desktop Auth */}
                    <div className="flex items-center gap-x-4">
                        {!user ? (
                            <>
                                <Link to="/login" className="hidden sm:block text-sm font-medium text-slate-300 transition-colors hover:text-indigo-400">
                                    Sign In
                                </Link>
                                <Link to="/register" className="rounded-lg bg-gradient-to-r from-indigo-500 to-emerald-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 transition-smooth hover:shadow-lg hover:shadow-indigo-500/50 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">
                                    Get Started
                                </Link>
                            </>
                        ) : (
                            <div className="hidden sm:flex items-center gap-4">
                                <Link
                                    to={user.user_type === 'admin' ? '/admin' : user.user_type === 'recruiter' ? '/recruiter' : '/seeker'}
                                    className="text-sm font-semibold text-indigo-400 transition-colors hover:text-indigo-300"
                                >
                                    Dashboard
                                </Link>
                                <div className="h-5 w-px bg-slate-700"></div>
                                <button
                                    onClick={handleLogout}
                                    className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-300 transition-smooth hover:bg-slate-700/50 hover:text-white"
                                >
                                    Logout
                                </button>
                            </div>
                        )}

                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-slate-300 hover:bg-slate-700/50 hover:text-indigo-400 md:hidden transition-smooth"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="border-t border-slate-700/50 bg-slate-900/95 backdrop-blur-sm md:hidden animate-slide-down">
                    <div className="space-y-1 px-4 pb-4 pt-3">
                        <Link to="/jobs" onClick={() => setIsMobileMenuOpen(false)} className="block rounded-lg px-4 py-3 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-700/50 hover:text-indigo-300">
                            Find Jobs
                        </Link>
                        <Link to="/employers" onClick={() => setIsMobileMenuOpen(false)} className="block rounded-lg px-4 py-3 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-700/50 hover:text-indigo-300">
                            For Employers
                        </Link>
                        <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="block rounded-lg px-4 py-3 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-700/50 hover:text-indigo-300">
                            About
                        </Link>

                        <div className="mt-4 border-t border-slate-700 pt-4">
                            {!user ? (
                                <div className="flex flex-col gap-3">
                                    <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="block w-full rounded-lg border border-slate-600 bg-slate-800/50 px-4 py-3 text-center text-sm font-semibold text-slate-200 transition-smooth hover:bg-slate-700/50 hover:border-slate-500">
                                        Sign In
                                    </Link>
                                    <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="block w-full rounded-lg bg-gradient-to-r from-indigo-500 to-emerald-500 px-4 py-3 text-center text-sm font-bold text-white shadow-lg shadow-indigo-500/30 transition-smooth hover:shadow-lg hover:shadow-indigo-500/50">
                                        Get Started
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <Link
                                        to={user.user_type === 'admin' ? '/admin' : user.user_type === 'recruiter' ? '/recruiter' : '/seeker'}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="block w-full rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-4 py-3 text-center text-sm font-bold text-indigo-300 transition-smooth hover:bg-indigo-500/20 hover:border-indigo-500/50"
                                    >
                                        Dashboard
                                    </Link>
                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="block w-full rounded-lg px-4 py-3 text-left text-sm font-medium text-red-400 transition-smooth hover:bg-red-500/10"
                                    >
                                        Logout <span className="text-xs text-slate-400">({user.email})</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
