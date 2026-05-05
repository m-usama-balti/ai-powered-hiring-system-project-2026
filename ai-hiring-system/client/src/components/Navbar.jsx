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
        <nav className="fixed top-0 left-0 right-0 z-50 w-full border-b border-slate-200 bg-white text-slate-800 shadow-sm">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-90">
                        <div className="rounded-lg bg-indigo-600 p-1.5 text-white shadow-sm">
                            <BriefcaseIcon className="h-5 w-5" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-slate-900">AI Hiring System</span>
                    </Link>

                    <div className="hidden items-center gap-8 md:flex">
                        <Link to="/jobs" className="text-sm font-medium text-slate-600 transition-colors hover:text-indigo-600">
                            Find Jobs
                        </Link>
                        <Link to="/employers" className="text-sm font-medium text-slate-600 transition-colors hover:text-indigo-600">
                            For Employers
                        </Link>
                        <Link to="/about" className="text-sm font-medium text-slate-600 transition-colors hover:text-indigo-600">
                            About
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        {!user ? (
                            <>
                                <Link to="/login" className="text-sm font-medium text-slate-600 transition-colors hover:text-indigo-600">
                                    Sign In
                                </Link>
                                <Link to="/register" className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700">
                                    Get Started
                                </Link>
                            </>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link
                                    to={user.user_type === 'admin' ? '/admin' : user.user_type === 'recruiter' ? '/recruiter' : '/seeker'}
                                    className="text-sm font-semibold text-indigo-600 transition-colors hover:text-indigo-800"
                                >
                                    Dashboard
                                </Link>
                                <div className="h-4 w-px bg-slate-300"></div>
                                <button
                                    onClick={handleLogout}
                                    className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-900"
                                >
                                    Logout
                                </button>
                            </div>
                        )}

                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-slate-600 hover:bg-slate-100 hover:text-indigo-600 md:hidden"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
                        </Button>
                    </div>
                </div>
            </div>

            {isMobileMenuOpen && (
                <div className="border-t border-slate-200 bg-slate-50 md:hidden">
                    <div className="space-y-2 px-4 pb-6 pt-4">
                        <Link to="/jobs" onClick={() => setIsMobileMenuOpen(false)} className="block rounded-md px-3 py-2 text-base font-medium text-slate-700 transition-colors hover:bg-indigo-50 hover:text-indigo-600">
                            Find Jobs
                        </Link>
                        <Link to="/employers" onClick={() => setIsMobileMenuOpen(false)} className="block rounded-md px-3 py-2 text-base font-medium text-slate-700 transition-colors hover:bg-indigo-50 hover:text-indigo-600">
                            For Employers
                        </Link>
                        <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="block rounded-md px-3 py-2 text-base font-medium text-slate-700 transition-colors hover:bg-indigo-50 hover:text-indigo-600">
                            About
                        </Link>

                        <div className="mt-2 border-t border-slate-200 pt-4">
                            {!user ? (
                                <div className="flex flex-col gap-3">
                                    <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="block w-full rounded-md border border-slate-300 bg-white px-4 py-2 text-center font-medium text-slate-700 transition-colors hover:bg-slate-50">
                                        Sign In
                                    </Link>
                                    <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="block w-full rounded-md bg-indigo-600 px-4 py-2 text-center font-bold text-white shadow-sm transition-colors hover:bg-indigo-700">
                                        Get Started
                                    </Link>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    <Link
                                        to={user.user_type === 'admin' ? '/admin' : user.user_type === 'recruiter' ? '/recruiter' : '/seeker'}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="block w-full rounded-md border border-indigo-200 bg-indigo-50 px-4 py-2 text-center font-semibold text-indigo-700 transition-colors hover:bg-indigo-100"
                                    >
                                        Dashboard
                                    </Link>
                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="block w-full rounded-md px-3 py-2 text-left text-base font-medium text-red-600 transition-colors hover:bg-red-50"
                                    >
                                        Logout ({user.user_type.replace('_', ' ')})
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
